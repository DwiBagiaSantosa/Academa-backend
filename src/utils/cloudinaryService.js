import { v2 as cloudinary } from "cloudinary";
import streamifier from 'streamifier';

export const uploadImage = (fileBuffer, { folder = 'uploads', allowedFormats = ['jpg', 'jpeg', 'png'] } = {}) => {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder,
          allowed_formats: allowedFormats,
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );
      streamifier.createReadStream(fileBuffer).pipe(stream);
    });
};

export const deleteImage = async (publicId) => {
    try {
      const result = await cloudinary.uploader.destroy(publicId);
      return result;
    } catch (error) {
      throw error;
    }
};