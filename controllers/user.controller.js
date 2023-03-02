const cloudinaryv2 = require("cloudinary");

const deleteUserProfilePic = async (user) => {
  const url = user.profilePicture;
  const url2 = url.split("/").pop();
  const filename = url2.substring(0, url2.lastIndexOf("."));
  console.log(filename);
  await cloudinaryv2.v2.uploader.destroy(
    "Profile/" + filename,
    { resource_type: "image", type: "upload" },
    function (error, result) {
      console.log("result:", result);
      console.log("error:", error);
      return result;
    }
  );
};
module.exports = { deleteUserProfilePic };
