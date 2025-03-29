import yt_dlp
import instaloader
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
import requests
import io

app = FastAPI()

# Enable CORS for frontend
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
        return None, "unknown"  # Unknown type (or private post)

@app.get("/preview/")
def get_preview(url: str):
    """Fetch Instagram media URL and type (image or reel)."""
    try:
        # Try yt-dlp for videos (reels)
        ydl_opts = {"quiet": True, "extract_flat": False}
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            try:
                info = ydl.extract_info(url, download=False)
                if "url" in info:
                    return {"preview_url": info["url"], "type": "reel"}  # It's a reel
            except Exception:
                pass  # yt-dlp failed (likely an image post)

        # Try instaloader for images
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
