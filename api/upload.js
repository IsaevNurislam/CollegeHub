// Vercel API Route for file upload
// File: api/upload.js

import formidable from 'formidable';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

// Initialize Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Verify JWT token
function verifyToken(token) {
  if (!token) return null;
  try {
    const tokenStr = token.replace('Bearer ', '');
    // Simple validation - in production use proper JWT verification
    return tokenStr.length > 0 ? { id: 1 } : null;
  } catch {
    return null;
  }
}

export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('[Upload API] Request received');

    // Check authentication
    const auth = req.headers.authorization;
    const user = verifyToken(auth);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    console.log('[Upload API] User authenticated, parsing form...');

    // Parse multipart form data
    const form = new formidable.IncomingForm();
    form.keepExtensions = true;

    const [fields, files] = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        else resolve([fields, files]);
      });
    });

    console.log('[Upload API] Form parsed, checking file...');

    // Get file
    const file = files.file?.[0];
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const folder = fields.folder?.[0] || 'Cloudy';

    console.log('[Upload API] File info:', {
      filename: file.originalFilename,
      size: `${(file.size / 1024).toFixed(2)}KB`,
      mimetype: file.mimetype
    });

    // Validate Cloudinary config
    if (!process.env.CLOUDINARY_CLOUD_NAME) {
      console.error('[Upload API] Cloudinary not configured');
      return res.status(500).json({
        error: 'Cloudinary not configured',
        details: 'Missing CLOUDINARY_* environment variables'
      });
    }

    console.log('[Upload API] Uploading to Cloudinary...');

    // Upload file
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: folder,
          overwrite: false,
          use_filename: false,
          unique_filename: false,
          display_name: file.originalFilename?.split('.')[0],
          resource_type: 'auto'
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );

      // Read file and pipe to upload stream
      const fileStream = fs.createReadStream(file.filepath);
      fileStream.pipe(uploadStream);
    });

    // Clean up temp file
    fs.unlinkSync(file.filepath);

    console.log('[Upload API] ✓ Success! URL:', result.secure_url);

    return res.status(200).json({
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      size: result.bytes,
      format: result.format
    });

  } catch (error) {
    console.error('[Upload API] Error:', error.message);
    return res.status(500).json({
      error: 'Upload failed',
      message: error.message
    });
  }
}

// Disable default body parsing for file upload
export const config = {
  api: {
    bodyParser: false
  }
};
