import os
import cv2
import numpy as np

src = r"C:\Users\MCS\.cursor\projects\c-Users-MCS-Desktop-fillie\assets\c__Users_MCS_AppData_Roaming_Cursor_User_workspaceStorage_fa067deb802f9023c4cdc047f3665839_images_image-c8c44634-35a6-46ad-9f6d-fdeead1437bb.png"
out_dir = os.path.join(os.path.dirname(__file__), "..", "assets", "images")
os.makedirs(out_dir, exist_ok=True)
out = os.path.join(out_dir, "sunset-giza-promo.png")

img = cv2.imread(src, cv2.IMREAD_COLOR)

mask = np.zeros(img.shape[:2], dtype=np.uint8)
cv2.circle(mask, (130, 170), 66, 255, -1)

result = cv2.inpaint(img, mask, inpaintRadius=14, flags=cv2.INPAINT_NS)
result = cv2.inpaint(result, mask, inpaintRadius=8, flags=cv2.INPAINT_TELEA)
result = cv2.inpaint(result, mask, inpaintRadius=4, flags=cv2.INPAINT_NS)

cv2.imwrite(out, result)
print("Saved", out)
