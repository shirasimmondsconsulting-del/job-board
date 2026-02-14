const cloudinary = require('../config/cloudinary');

class UploadService {
  // Upload profile image
  static async uploadProfileImage(file, userId) {
    try {
      const result = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          {
            folder: `${process.env.CLOUDINARY_FOLDER}/profiles/${userId}`,
            resource_type: 'auto',
            quality: 'auto',
            format: 'webp',
            transformation: [
              { width: 400, height: 400, crop: 'fill', gravity: 'face' }
            ]
          },
          (error, result) => {
            if (error) reject(error);
            resolve(result);
          }
        ).end(file.buffer);
      });

      return {
        url: result.secure_url,
        publicId: result.public_id
      };
    } catch (error) {
      console.error('Profile image upload error:', error);
      throw new Error('Failed to upload profile image');
    }
  }

  // Upload resume
  static async uploadResume(file, userId) {
    try {
      const result = await new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            {
              folder: `${
                process.env.CLOUDINARY_FOLDER || "job-board"
              }/resumes/${userId}`,
              resource_type: "raw",
              use_filename: true,
              unique_filename: true,
            },
            (error, result) => {
              if (error) reject(error);
              resolve(result);
            },
          )
          .end(file.buffer);
      });

      return {
        url: result.secure_url,
        publicId: result.public_id
      };
    } catch (error) {
      console.error('Resume upload error:', error);
      throw new Error('Failed to upload resume');
    }
  }

  // Upload company logo
  static async uploadCompanyLogo(file, companyId) {
    try {
      const result = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          {
            folder: `${process.env.CLOUDINARY_FOLDER}/companies/${companyId}/logo`,
            resource_type: 'auto',
            quality: 'auto',
            format: 'webp',
            transformation: [
              { width: 200, height: 200, crop: 'fill' }
            ]
          },
          (error, result) => {
            if (error) reject(error);
            resolve(result);
          }
        ).end(file.buffer);
      });

      return {
        url: result.secure_url,
        publicId: result.public_id
      };
    } catch (error) {
      console.error('Company logo upload error:', error);
      throw new Error('Failed to upload company logo');
    }
  }

  // Upload company banner
  static async uploadCompanyBanner(file, companyId) {
    try {
      const result = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          {
            folder: `${process.env.CLOUDINARY_FOLDER}/companies/${companyId}/banner`,
            resource_type: 'auto',
            quality: 'auto',
            format: 'webp',
            transformation: [
              { width: 1200, height: 400, crop: 'fill' }
            ]
          },
          (error, result) => {
            if (error) reject(error);
            resolve(result);
          }
        ).end(file.buffer);
      });

      return {
        url: result.secure_url,
        publicId: result.public_id
      };
    } catch (error) {
      console.error('Company banner upload error:', error);
      throw new Error('Failed to upload company banner');
    }
  }

  // Delete file from Cloudinary
  static async deleteFile(publicId) {
    try {
      const result = await cloudinary.uploader.destroy(publicId);
      return result;
    } catch (error) {
      console.error('File deletion error:', error);
      throw new Error('Failed to delete file');
    }
  }

  // Generate secure URL with transformations
  static generateSecureUrl(publicId, transformations = {}) {
    return cloudinary.url(publicId, {
      secure: true,
      ...transformations
    });
  }

  // Get file info
  static async getFileInfo(publicId) {
    try {
      const result = await cloudinary.api.resource(publicId);
      return result;
    } catch (error) {
      console.error('File info error:', error);
      throw new Error('Failed to get file info');
    }
  }
}

module.exports = UploadService;