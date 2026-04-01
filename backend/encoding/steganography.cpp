#include <iostream>
#include <fstream>
#include <vector>
#include <string>
#include <stdexcept>
#include <cstdint>
#include <algorithm>

using namespace std;

struct Pixel {
    uint8_t r, g, b;
};

class Image {
public:
    int width;
    int height;
    vector<Pixel> pixels;
    int total_channels;

    Image(int w, int h) : width(w), height(h), pixels(w * h, {0, 0, 0}), total_channels(w * h * 3) {}

    static Image loadFromBinary(const string& filename, int w, int h) {
        Image img(w, h);
        ifstream file(filename, ios::binary);
        if (!file) throw runtime_error("Could not open input file");
        
        for (int i = 0; i < w * h; ++i) {
            file.read(reinterpret_cast<char*>(&img.pixels[i].r), 1);
            file.read(reinterpret_cast<char*>(&img.pixels[i].g), 1);
            file.read(reinterpret_cast<char*>(&img.pixels[i].b), 1);
        }
        return img;
    }

    void saveToBinary(const string& filename) const {
        ofstream file(filename, ios::binary);
        if (!file) throw runtime_error("Could not open output file");
        
        for (const auto& p : pixels) {
            file.write(reinterpret_cast<const char*>(&p.r), 1);
            file.write(reinterpret_cast<const char*>(&p.g), 1);
            file.write(reinterpret_cast<const char*>(&p.b), 1);
        }
    }
};

class BinaryUtils {
public:
    static vector<int> stringToBits(const string& str) {
        vector<int> bits;
        for (char c : str) {
            for (int i = 7; i >= 0; --i) {
                bits.push_back((c >> i) & 1);
            }
        }
        return bits;
    }

    static string bitsToString(const vector<int>& bits) {
        string str;
        for (size_t i = 0; i < bits.size(); i += 8) {
            char c = 0;
            for (int j = 0; j < 8; ++j) {
                if (i + j < bits.size()) {
                    c |= (bits[i + j] << (7 - j));
                }
            }
            str.push_back(c);
        }
        return str;
    }

    static vector<int> intToBits(int value, int width) {
        vector<int> bits(width);
        for (int i = 0; i < width; ++i) {
            bits[width - 1 - i] = (value >> i) & 1;
        }
        return bits;
    }

    static int bitsToInt(const vector<int>& bits) {
        int value = 0;
        for (int b : bits) {
            value = (value << 1) | b;
        }
        return value;
    }
};

class BitAccessor {
public:
    static uint8_t& getChannel(Image& img, int channelIndex) {
        int pixelIndex = channelIndex / 3;
        int color = channelIndex % 3;
        if (color == 0) return img.pixels[pixelIndex].r;
        if (color == 1) return img.pixels[pixelIndex].g;
        return img.pixels[pixelIndex].b;
    }

    static const uint8_t& getChannelConst(const Image& img, int channelIndex) {
        int pixelIndex = channelIndex / 3;
        int color = channelIndex % 3;
        if (color == 0) return img.pixels[pixelIndex].r;
        if (color == 1) return img.pixels[pixelIndex].g;
        return img.pixels[pixelIndex].b;
    }

    static void writeBit(Image& img, int channelIndex, int layer, int bit) {
        uint8_t& val = getChannel(img, channelIndex);
        if (bit) {
            val |= (1 << layer);
        } else {
            val &= ~(1 << layer);
        }
    }

    static int readBit(const Image& img, int channelIndex, int layer) {
        const uint8_t& val = getChannelConst(img, channelIndex);
        return (val >> layer) & 1;
    }
};

class CapacityCalculator {
public:
    static int maxMessageBits(const Image& img) {
        // Safe channels: 0 to total_channels - 10 (exclusive limit = total_channels - 9)
        int totalChannels = img.total_channels;
        int safeChannels = totalChannels - 9;
        if (safeChannels <= 16) return -1;
        
        int availableLayer0 = safeChannels - 16;
        int availableLayer1 = safeChannels;
        return availableLayer0 + availableLayer1;
    }

    static void check(const Image& img, int messageBits) {
        int maxBits = maxMessageBits(img);
        if (maxBits < 0) throw runtime_error("Image too small to fit header and watermark");
        if (messageBits > maxBits) throw runtime_error("Message exceeds image capacity over 2 layers");
    }
};

class Encoder {
public:
    static void encode(Image& img, const string& message) {
        int totalChannels = img.total_channels;
        if (totalChannels < 9 + 16) throw runtime_error("Image too small");

        string watermarkData = string(2, '\0') + "Emagine"; // 2 zero chars + 7 chars = 9 chars
        
        // Write the watermark by completely overwriting the last 9 channels.
        // Reading order backward: C[-1], C[-2], etc.
        for (int i = 0; i < 9; ++i) {
            uint8_t& val = BitAccessor::getChannel(img, totalChannels - 1 - i);
            val = static_cast<uint8_t>(watermarkData[i]);
        }

        // 2. Encode Header (channels 0-15, layer 0)
        vector<int> msgBits = BinaryUtils::stringToBits(message);
        CapacityCalculator::check(img, msgBits.size());

        vector<int> headerBits = BinaryUtils::intToBits(msgBits.size(), 16);
        for (int i = 0; i < 16; ++i) {
            BitAccessor::writeBit(img, i, 0, headerBits[i]);
        }

        // 3. Encode Message bits
        int safeChannelsLimit = totalChannels - 9;
        int currentChannel = 16;
        int currentLayer = 0;
        
        for (int bit : msgBits) {
            BitAccessor::writeBit(img, currentChannel, currentLayer, bit);
            currentChannel++;
            if (currentChannel == safeChannelsLimit) {
                if (currentLayer == 0) {
                    currentLayer = 1;
                    currentChannel = 0; // Spill over to layer 1, start at channel 0
                } else {
                    throw runtime_error("Exceeded layer 1 capacity during encoding");
                }
            }
        }
    }
};

class Decoder {
public:
    static string decode(const Image& img) {
        int totalChannels = img.total_channels;
        if (totalChannels < 9 + 16) throw runtime_error("Image too small");

        // 1. Read Watermark
        string watermarkData(9, '\0');
        for (int i = 0; i < 9; ++i) {
            watermarkData[i] = BitAccessor::getChannelConst(img, totalChannels - 1 - i);
        }
        string sig = watermarkData.substr(2, 7);
        if (sig != "Emagine") {
            throw runtime_error("No valid Emagine steganographic data found");
        }

        // 2. Read Header
        vector<int> headerBits(16);
        for (int i = 0; i < 16; ++i) {
            headerBits[i] = BitAccessor::readBit(img, i, 0);
        }
        int msgBitLength = BinaryUtils::bitsToInt(headerBits);

        CapacityCalculator::check(img, msgBitLength);

        // 3. Read Message
        vector<int> msgBits;
        int safeChannelsLimit = totalChannels - 9;
        int currentChannel = 16;
        int currentLayer = 0;

        for (int i = 0; i < msgBitLength; ++i) {
            msgBits.push_back(BitAccessor::readBit(img, currentChannel, currentLayer));
            currentChannel++;
            if (currentChannel == safeChannelsLimit) {
                if (currentLayer == 0) {
                    currentLayer = 1;
                    currentChannel = 0;
                } else {
                    throw runtime_error("Message length exceeds valid bit storage layout");
                }
            }
        }
        
        return BinaryUtils::bitsToString(msgBits);
    }
};

int main(int argc, char* argv[]) {
    try {
        if (argc < 4) throw runtime_error("Invalid arguments");
        string mode = argv[1];
        
        if (mode == "encode") {
            if (argc != 7) throw runtime_error("Usage: ./steg encode <input_bin> <output_bin> <width> <height> <message>");
            string in_bin = argv[2];
            string out_bin = argv[3];
            int w = stoi(argv[4]);
            int h = stoi(argv[5]);
            string msg = argv[6];
            
            Image img = Image::loadFromBinary(in_bin, w, h);
            Encoder::encode(img, msg);
            img.saveToBinary(out_bin);
            
            cout << "Encoded successfully" << endl;
            return 0;
        } else if (mode == "decode") {
            if (argc != 5) throw runtime_error("Usage: ./steg decode <input_bin> <width> <height>");
            string in_bin = argv[2];
            int w = stoi(argv[3]);
            int h = stoi(argv[4]);
            
            Image img = Image::loadFromBinary(in_bin, w, h);
            string msg = Decoder::decode(img);
            cout << msg;
            return 0;
        } else {
            throw runtime_error("Unknown mode. Use encode or decode.");
        }
    } catch (const exception& e) {
        cerr << e.what() << endl;
        return 1;
    }
}
