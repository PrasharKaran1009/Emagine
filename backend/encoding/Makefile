CXX = g++
CXXFLAGS = -std=c++17 -O3 -Wall -Wextra

TARGET = steg
SRC = steganography.cpp

all: $(TARGET)

$(TARGET): $(SRC)
	$(CXX) $(CXXFLAGS) -o $(TARGET) $(SRC)

clean:
	rm -f $(TARGET)
