import multer from 'multer'; import path from 'path'; import crypto from 'crypto'; import fs from 'fs';
const dir=path.resolve('uploads'); fs.mkdirSync(dir,{recursive:true}); const storage=multer.diskStorage({destination:dir,filename:(req,file,cb)=>cb(null,crypto.randomBytes(12).toString('hex')+path.extname(file.originalname).toLowerCase())});
const allowed=new Set(['application/pdf','image/jpeg','image/png','image/webp','text/plain','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document','application/vnd.ms-excel','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']);
export const upload=multer({storage,limits:{fileSize:Number(process.env.MAX_FILE_SIZE||10485760)},fileFilter:(req,file,cb)=>cb(null,allowed.has(file.mimetype))});
