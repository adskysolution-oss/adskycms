import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadImage = async (file, folder = 'adsky') => {
  try {
    const response = await cloudinary.uploader.upload(file, {
      folder,
      resource_type: 'auto',
    });
    return { success: true, url: response.secure_url, public_id: response.public_id };
  } catch (error) {
    console.error('Cloudinary Upload Error:', error);
    return { success: false, error: error.message };
  }
};

export const deleteImage = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId);
    return { success: true };
  } catch (error) {
    console.error('Cloudinary Delete Error:', error);
    return { success: false, error: error.message };
  }
};

export default cloudinary;
