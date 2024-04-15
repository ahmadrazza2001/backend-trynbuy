const multer = require("multer");
const sharp = require("sharp");
const ErrorHandler = require("../config/ErrorHandler");
const { cloudinaryConfig, uploader } = require("../config/cloudinaryConfig");
const storage = multer.memoryStorage();
exports.upload = multer({ storage: storage });
cloudinaryConfig();

exports.processImage = async (file) => {
  const sharpOutput = await sharp(file.buffer)
    .resize({
      width: 800,
      height: 600,
      fit: sharp.fit.inside,
      withoutEnlargement: true,
    })
    .jpeg({ quality: 80, progressive: true })
    .toBuffer();
  const imageUrl = await uploadToCloudinary(sharpOutput);
  console.log(imageUrl);
  return imageUrl;
};

const uploadToCloudinary = (imageBuffer) => {
  return new Promise((resolve, reject) => {
    uploader
      .upload_stream({ resource_type: "auto" }, (error, result) => {
        if (error) {
          reject(new ErrorHandler("Error Uploading", 400));
        } else {
          const imageUrl = result.secure_url;
          resolve(imageUrl);
        }
      })
      .end(imageBuffer);
  });
};

exports.uniqueToken = (digits) => {
  const charset =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let token = "";
  for (let i = 0; i < digits; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    token += charset.charAt(randomIndex);
  }
  return token;
};
