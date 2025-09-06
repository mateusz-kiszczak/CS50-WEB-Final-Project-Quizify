from pathlib import Path
import datetime
from PIL import Image
from django.conf import settings



# Function resizes and renames an image attached to instance.field_name
# Function saves all the images in webp format

# Arguments:
# instance - the model instance
# field_name - the name of the ImageField
# max_size - e.g. (max_width, max_height)
# new_name_func - callable function thta returns the new given name

def resize_and_rename_image(instance, field_name, max_size, new_name_func):

    # Open the image from instance.field_name.path
    img_field = getattr(instance, field_name)
    if not img_field:
        return
    
    file_path = Path(img_field.path)
    try:
        img = Image.open(file_path)
    except Exception as e:
        print(f"Error opening image for field '{field_name}': {e}")
        return
    
    # Resize image down if it's wider or higher than max dimentions
    if img.width > max_size[0] or img.height > max_size[1]:
        img.thumbnail(max_size, Image.Resampling.LANCZOS)

    # Get current date in DDMMYYYY format
    current_date = datetime.datetime.now().strftime("%d%m%Y")
    new_filename = new_name_func(instance, current_date)

    # Get the directory path where the image is stored
    directory = file_path.parent
    new_file_path = directory / new_filename

    try:
        # Save the resized image as webp under the new name with a chosen quality settings
        img.save(new_file_path, "WEBP", quality=85)

        # If the new file name is different, remove the old file to avoid duplicates
        if file_path.name != new_filename and file_path.exists():
            file_path.unlink()

        # Update the image field to take care of the new file location
        # Calculate the relative path from MEDIA_ROOT
        media_root = Path(settings.MEDIA_ROOT)
        new_relative_path = str(new_file_path.relative_to(media_root))
        setattr(instance, field_name, new_relative_path)

        # Save the instance update
        instance.save(update_fields=[field_name])
    except Exception as e:
        print(f"Error saving the processed image for field '{field_name}': {e}")


# Custom name functions that generates a thumbnail name

# Quiz front image
# Example output: "quiz_7_27042025.webp"
def quiz_image_rename(instance, current_date):
    return f"quiz_{instance.pk}_{current_date}.webp"

# Question image
# Example output: "quiz_7_question_3_27042025.webp"
def question_image_rename(instance, current_date):
    return f"quiz_{instance.quiz.pk}_question_{instance.pk}_{current_date}.webp"

# Avatar image
# Example output: "username.webp"
# The username is unique so the date in the name is ommited
def avatar_image_rename(instance, current_date):
    return f"{instance.user.username}.webp"
