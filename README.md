# Thermal - RGB Image Translation (Dense U-Net + PatchGAN)

**Project:** Thermal-to-RGB image-to-image translation using a Dense U-Net generator and a PatchGAN discriminator.  

**Authors:** [Name / Roll number] 
1. Prithvi Ahuja - 102316102
2. Sahil Kumar - 102316091
3. Chaitanya Singh - 102316106
4. Siddhant Bhardwaj - 102316117


---

## Overview

This repository contains an implementation and experimental setup for translating thermal (TIR) images to RGB images using a conditional GAN framework. The model uses a Dense U-Net generator and a PatchGAN-style discriminator with spectral normalization. The training follows a progressive partitioning strategy: the dataset is split into 10 parts and the model is trained on each part sequentially (100 epochs per part), with an optional generator warm-up.

---

## Features

- Dense U-Net generator (GELU activations, dropout)  
- PatchGAN-style discriminator with spectral normalization  
- Losses: adversarial (BCEWithLogits), L1 reconstruction, VGG19 perceptual loss  
- Progressive training (10 parts × 100 epochs = 1000 effective epochs)  
- Generator warm-up (5 epochs) with L1 + perceptual loss  
- Mixed-precision training (torch.amp)  
- Evaluation: PSNR and SSIM  
- Checkpointing and periodic evaluation every 20 epochs


---

Dataset Link: `https://www.sciencedirect.com/science/article/pii/S1350449524003268`