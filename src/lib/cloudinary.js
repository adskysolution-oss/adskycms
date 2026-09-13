import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadImage = async (file, folder = 'adsky') => {
  try {
    let uploadSource = file;

    // Handle Web API File or Blob instances from Next.js formData
    if (file && typeof file === 'object' && typeof file.arrayBuffer === 'function') {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const mimeType = file.type || 'image/jpeg';
      uploadSource = `data:${mimeType};base64,${buffer.toString('base64')}`;
    } else if (file && Buffer.isBuffer(file)) {
      uploadSource = `data:image/jpeg;base64,${file.toString('base64')}`;
    }

    const response = await cloudinary.uploader.upload(uploadSource, {
      folder,
      resource_type: 'auto',
    });

    return {
      success: true,
      url: response.secure_url || response.url,
      publicId: response.public_id,
      public_id: response.public_id,
      width: response.width,
      height: response.height,
      format: response.format,
    };
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
