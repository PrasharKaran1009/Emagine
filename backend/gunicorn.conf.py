# Gunicorn configuration.
#
# Gunicorn auto-loads ./gunicorn.conf.py from its working directory, so these
# settings apply whether the app is started via the Procfile OR a Render
# dashboard "Start Command" (as long as that command doesn't override them on
# the CLI). This is what guarantees the timeout fix actually takes effect.

workers = 2
worker_class = "uvicorn.workers.UvicornWorker"

# The image pipeline (NLM denoise, super-res, CLAHE, sharpen) blocks the event
# loop, so the worker can't send heartbeats. Gunicorn's default 30s timeout then
# SIGKILLs the worker mid-request -> the stream dies partway (the "stuck at
# step 3" bug). 120s gives the pipeline room to finish on a slow shared CPU.
timeout = 120
graceful_timeout = 30
