import supabase from "/scripts/supabase.js";

export function getPublicImageUrl(imagePath, bucket = "orderflow") {
  if (!imagePath) return "";
  return supabase.getUrl(bucket, imagePath).publicUrl;
}

export function setOptionalImage(imgEl, imageUrl) {
  if (imageUrl) {
    imgEl.src = imageUrl;
    imgEl.hidden = false;
    return;
  }

  imgEl.removeAttribute("src");
  imgEl.hidden = true;
}
