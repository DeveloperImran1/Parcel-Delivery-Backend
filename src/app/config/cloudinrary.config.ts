/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import stream from 'stream';
import AppError from '../errorHelpers/AppError';
import { envVars } from './env';

// Front-end -> form-data with image file -> Multer -> form-data -> Req (Body + File)
// Amra age cloudinary te image upload kore image link generate kore front-end theke json akare send kortam. But multer package er maddhome image er file, ba pdf, cvs file ke send kora jai form-datar maddhome. Backend a Multer er maddhome image file ke req.File er moddhe save kore and other data gulo ke req.Body er moddhe save kore. Tarpor backend a jei cloud use korbo. ex: Cloudinary te sei file gulo upload kore link generate korte parbo.

// Akhon bisoy hosse backend a multer form-data theke image file ke req.File er moddhe kivabe save kortese?? Aita backend a multer nijer akta temporary folder create kortese. Jar moddhe form-data theke asa data gulo ke store kore. Ai folder ta amader project er moddhe ba amader local-computer a kore.

// But aikhane Multer storage cloudinary package use korbo. Jar maddhome amader nijer project a oi image ke save na kore, coludinary er storate a save korbe. Then coludinary te host kore req.file er moddhe sei image er link ke set kore diba.

cloudinary.config({
  cloud_name: envVars.CLOUDINARY.CLOUDINARY_CLOUD_NAME,
  api_key: envVars.CLOUDINARY.CLOUDINARY_API_KEY,
  api_secret: envVars.CLOUDINARY.CLOUDINARY_API_SECRET,
});

export const cloudinaryUpload = cloudinary;

// Cloudinary te upload kora image ke delete korbo:

// Let ami tour create kortesi. Jar jonno 1st a image upload korlam cloudinary te. Then tour.services.ts file a post korar somoi, jodi kono karone error throw kori. Tahole oi tour create hobena. But image ta already cloudinary te upload hoia gese. Aita inconcistency hoia jasse. Tai airkomo system korte hobe. jodi last porjonto post ta create na hoi. Tahole coludinary theke image gulo delete hobe.

// Akhon ai image delete korar function deleteImageFromCloudinary ta kothai use korbo?? tour.services.ts ba jekono file a kono error hole amra error thorw kori. Tokhon globalErrorHandler er moddhe jai. Ar globalErrorHandler er moddhe req theke images er link pawa jai. Sei globalErrorHandler er moddhei ai function ke call korbo.
export const deleteImageFromCloudinary = async (url: string) => {
  try {
    // Already upload kora kono image ke delte korte hole oi image er public id dia delete korte hobe. Akta image er moddhe ai public id ta thake. multer.ts file a uniqueFileName amra create koresilam. oi full name tai holo public id.
    // Aita holo cloudinary te host kora image er url: https://res.cloudinary.com/djzppynpk/image/upload/v1753126572/ay9roxiv8ue-1753126570086-download-2-jpg.jpg.jpg   ---> Ai url er moddhe ai partta holo public id: ay9roxiv8ue-1753126570086-download-2-jpg.jpg  --> last er jpg tao bad jabe. Jeita cloudinary theke jpg or png add hoisa.

    const regex = /\/v\d+\/(.*?)\.(jpg|jpeg|png|gif|webp)$/i;
    const match = url.match(regex);

    if (match && match[1]) {
      const public_id = match[1];
      await cloudinary.uploader.destroy(public_id);
      console.log(`File ${public_id} is deleted from coludinary`);
    }
  } catch (error: any) {
    throw new AppError(401, 'Cloudinary image deletion failed', error.message);
  }
};

// Amra image upload korar somoi front-end theke image nia Multer Storage cloudinary use kore aumatic upload koresi cloudinary te. But user booking er payment korle pdf create kore email kore invoice er pdf send kortesi email a. Ar sei pdf cloudinary te akhon manualy upload kore then DB te set korte hobe. Akhon ai multer storage er kajta manualy korbo niche
export const uploadBufferToCloudinary = async (
  buffer: Buffer,
  filename: string,
): Promise<UploadApiResponse | undefined> => {
  try {
    return new Promise((resolve, reject) => {
      const public_id = `pdf/${filename}-${Date.now()}`;
      const bufferStream = new stream.PassThrough();
      bufferStream.end(buffer);

      cloudinary.uploader
        .upload_stream(
          {
            resource_type: 'auto',
            public_id: public_id,
            folder: 'pdf',
          },
          (error, result) => {
            if (error) {
              return reject(error);
            }
            resolve(result);
          },
        )
        .end(buffer);
    });
  } catch (error: any) {
    console.log(error);
    throw new AppError(401, `Error uploading file ${error.message}`);
  }
};
