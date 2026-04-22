# Use an official Python runtime as a parent image
FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Set the working directory in the container
WORKDIR /app

# Copy the requirements file into the container
COPY requirements.txt .

# Install any needed packages specified in requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy the current directory contents into the container
COPY . .

# IMPORTANT: Run the ML training script during the build process to generate the .pkl models
# This ensures the Docker image is self-contained and ready to serve predictions immediately
RUN python ml/train_model.py

# Make port 5000 available to the world outside this container
EXPOSE 5000

# Run waitress as the production WSGI server
CMD ["waitress-serve", "--port=5000", "app:app"]
