import { Injectable } from '@nestjs/common';
import { v2 as cloudinary, TransformationOptions } from 'cloudinary';
import { ConfigService } from '../config/config.service';

export class StorageConfig {
  constructor(
    public cloudName: string,
    public apiKey: string,
    public apiSecret: string,
  ) {}
}

@Injectable()
export class StorageService {
  private cloudinary: typeof cloudinary;

  constructor(private configService: ConfigService) {
    // Configure Cloudinary
    this.cloudinary = cloudinary;
    this.cloudinary.config({
      cloud_name: this.configService.cloudinaryCloudName,
      api_key: this.configService.cloudinaryApiKey,
      api_secret: this.configService.cloudinaryApiSecret,
    });
  }

  async upload(
    folder: string,
    fileName: string,
    file: Buffer,
  ): Promise<string> {
    try {
      // Convert buffer to base64 string for Cloudinary
      const base64File = `data:image/jpeg;base64,${file.toString('base64')}`;

      const result = await this.cloudinary.uploader.upload(base64File, {
        folder: folder,
        public_id: fileName.replace(/\.[^/.]+$/, ''), // Remove file extension for public_id
        resource_type: 'image',
        overwrite: true,
      });

      return result.secure_url;
    } catch (error) {
      throw new Error(`Failed to upload image: ${error.message}`);
    }
  }

  async delete(imageURL: string): Promise<void> {
    try {
      // Extract public_id from Cloudinary URL
      const publicId = this.extractPublicIdFromUrl(imageURL);

      if (publicId) {
        await this.cloudinary.uploader.destroy(publicId);
      }
    } catch (error) {
      // Log error but don't throw to avoid breaking the application flow
      console.error(`Failed to delete image: ${error.message}`);
    }
  }

  private extractPublicIdFromUrl(imageURL: string): string | null {
    try {
      // Cloudinary URL format: https://res.cloudinary.com/cloud_name/image/upload/v1234567890/folder/filename.jpg
      const urlParts = imageURL.split('/');
      const uploadIndex = urlParts.findIndex((part) => part === 'upload');

      if (uploadIndex !== -1 && uploadIndex + 2 < urlParts.length) {
        // Skip version number and get the folder/filename part
        const publicIdParts = urlParts.slice(uploadIndex + 2);
        return publicIdParts.join('/').replace(/\.[^/.]+$/, ''); // Remove file extension
      }

      return null;
    } catch (error) {
      console.error(`Failed to extract public_id from URL: ${error.message}`);
      return null;
    }
  }

  // Helper method to get image URL with transformations
  getImageUrl(
    publicId: string,
    transformations?: TransformationOptions,
  ): string {
    const options: any = { secure: true };
    if (transformations) {
      Object.assign(options, transformations);
    }
    return this.cloudinary.url(publicId, options);
  }
}
