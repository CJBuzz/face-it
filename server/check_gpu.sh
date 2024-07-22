#!/bin/bash

# Check for NVIDIA GPU
if lspci | grep -i NVIDIA; then
    echo "NVIDIA GPU detected. Installing GPU dependencies, CUDA Toolkit and cuDNN."
    wget https://developer.download.nvidia.com/compute/cuda/repos/ubuntu2004/x86_64/cuda-ubuntu2004.pin && \
    mv cuda-ubuntu2004.pin /etc/apt/preferences.d/cuda-repository-pin-600 && \
    wget https://developer.download.nvidia.com/compute/cuda/11.8.0/local_installers/cuda-repo-ubuntu2004-11-8-local_11.8.0-470.57.02-1_amd64.deb && \
    dpkg -i cuda-repo-ubuntu2004-11-8-local_11.8.0-470.57.02-1_amd64.deb && \
    apt-key add /var/cuda-repo-ubuntu2004-11-8-local/7fa2af80.pub && \
    apt-get update && \
    apt-get -y install cuda
    pip install --no-cache-dir -r requirements-gpu.txt
    pip install --no-cache-dir -r requirements-torch-gpu.txt
else
    echo "No NVIDIA GPU detected. Installing CPU dependencies."
    pip install --no-cache-dir -r requirements.txt
fi

pip install wheels/insightface-0.7.3-cp311-cp311-win_amd64.whl