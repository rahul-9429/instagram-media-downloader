import yt_dlp
import instaloader
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
import requests
import io

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_instagram_image(post_url):
    """Extract the highest quality image from an Instagram post."""
    loader = instaloader.Instaloader()
    
    try:
        shortcode = post_url.split("/")[-2]  # Extract post ID
        post = instaloader.Post.from_shortcode(loader.context, shortcode)

        if post.is_video:
            return None, "reel"  # It's a reel (video)
        else:
            return post.url, "image"  # Return image URL

    except Exception:
        return None, "unknown"   

@app.get("/preview/")
def get_preview(url: str):
    """Fetch Instagram media URL and type (image or reel)."""
    try:
        ydl_opts = {"quiet": True, "extract_flat": False}
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            try:
                info = ydl.extract_info(url, download=False)
                if "url" in info:
                    return {"preview_url": info["url"], "type": "reel"}  # It's a reel
            except Exception:
                pass   

        image_url, post_type = get_instagram_image(url)
        if image_url:
            return {"preview_url": image_url, "type": post_type}  # It's an image

        raise HTTPException(status_code=400, detail="No video or image found")

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/download/")
def download_media(url: str = Query(..., description="Direct media URL")):
    """Download the Instagram media (image or video)."""
    try:
        response = requests.get(url, stream=True)
        if response.status_code != 200:
            raise HTTPException(status_code=400, detail="Failed to fetch media")

        file_type = response.headers.get("Content-Type", "application/octet-stream")
        extension = file_type.split("/")[-1]
        filename = f"instagram_media.{extension}"

        return StreamingResponse(io.BytesIO(response.content), 
                                 media_type=file_type,
                                 headers={"Content-Disposition": f"attachment; filename={filename}"})

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.get("/profile/")
def get_profile(user: str = Query(..., description="Instagram username or profile URL")):
    """Download the profile picture of an Instagram user from username or profile URL."""
    try:
        if "instagram.com" in user:
            parts = user.rstrip('/').split('/')
            username = parts[-1] if parts[-1] else parts[-2]
        else:
            username = user

        loader = instaloader.Instaloader()
        profile = instaloader.Profile.from_username(loader.context, username)
        profile_pic_url = profile.profile_pic_url

        response = requests.get(profile_pic_url, stream=True)
        if response.status_code != 200:
            raise HTTPException(status_code=400, detail="Failed to fetch profile picture")

        return StreamingResponse(io.BytesIO(response.content),
                                 media_type="image/jpeg",
                                 headers={"Content-Disposition": f"attachment; filename={username}_profile.jpg"})
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
