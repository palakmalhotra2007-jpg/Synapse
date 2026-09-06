import os
from PIL import Image

def make_transparent(input_path, output_path):
    img = Image.open(input_path).convert("RGBA")
    datas = img.getdata()
    
    new_data = []
    white_thresh = 248
    soft_thresh = 228
    
    for item in datas:
        r, g, b, a = item
        # If pure white / light gray background
        if r >= white_thresh and g >= white_thresh and b >= white_thresh:
            new_data.append((255, 255, 255, 0))
        elif r >= soft_thresh and g >= soft_thresh and b >= soft_thresh:
            # Smooth edge anti-aliasing
            min_c = min(r, min(g, b))
            factor = (min_c - soft_thresh) / (white_thresh - soft_thresh)
            alpha = int(max(0, min(255, (1.0 - factor) * 255)))
            new_data.append((r, g, b, alpha))
        else:
            new_data.append(item)
            
    img.putdata(new_data)
    
    # Auto-crop to content bounding box
    bbox = img.getbbox()
    if bbox:
        cropped = img.crop(bbox)
        # Pad slightly
        pad_x = 24
        pad_y = 24
        padded = Image.new("RGBA", (cropped.width + pad_x * 2, cropped.height + pad_y * 2), (0, 0, 0, 0))
        padded.paste(cropped, (pad_x, pad_y))
        padded.save(output_path, "PNG")
        print(f"Successfully created: {output_path} with size {padded.size}")
    else:
        img.save(output_path, "PNG")
        print(f"Successfully created: {output_path} with size {img.size}")

if __name__ == "__main__":
    src = r"C:\Users\Pankaj Malhotra\.gemini\antigravity-ide\brain\689c0557-365b-49fd-bbe1-53633298ce08\original_vtuber_avatar_1788686533250.jpg"
    dest = r"c:\Users\Pankaj Malhotra\Downloads\Synapse\public\character\live_anime_character.png"
    make_transparent(src, dest)
