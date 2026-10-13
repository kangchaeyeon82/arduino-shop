// 메인 배너·카테고리 사진 출처 (CC 라이선스 표기)
import type { ImageCredit } from "./utils";

export const HERO_IMAGES: { image: string; credit: ImageCredit }[] = [
  {
    "image": "/images/hero/hero-1.jpg",
    "credit": {
      "author": "TreyDanger",
      "license": "CC BY 2.0",
      "source_url": "https://commons.wikimedia.org/wiki/File:Arduino_%26_breadboard,_mounted.jpg"
    }
  },
  {
    "image": "/images/hero/hero-2.jpg",
    "credit": {
      "author": "James Bastow",
      "license": "CC BY-SA 2.0",
      "source_url": "https://commons.wikimedia.org/wiki/File:Electronics_workbench.jpg"
    }
  },
  {
    "image": "/images/hero/hero-3.jpg",
    "credit": {
      "author": "Lukaststanley",
      "license": "CC BY-SA 3.0",
      "source_url": "https://commons.wikimedia.org/wiki/File:Arduino_Breadboard_LCD_Trial_One.jpg"
    }
  }
];

export const CATEGORY_IMAGE_CREDITS: Record<string, ImageCredit> = {
  "boards": {
    "author": "Kleinesfilmröllchen",
    "license": "CC BY 4.0",
    "source_url": "https://commons.wikimedia.org/wiki/File:Microcontroller_collection.jpg"
  },
  "sensors": {
    "author": "Nevit Dilmen (talk)",
    "license": "CC BY-SA 3.0",
    "source_url": "https://commons.wikimedia.org/wiki/File:HC_SR04_Ultrasonic_sensor_1480322_3_4_HDR_Enhancer.jpg"
  },
  "motors": {
    "author": "cibomahto",
    "license": "CC BY-SA 2.0",
    "source_url": "https://www.flickr.com/photos/15633330@N07/2252712425"
  },
  "displays": {
    "author": "Retired electrician",
    "license": "CC0",
    "source_url": "https://commons.wikimedia.org/wiki/File:MELT_16x2_LCD_alphanumeric_display_02(DXO).jpg"
  },
  "parts": {
    "author": "Windell Oskay (oskay)",
    "license": "CC BY 2.0",
    "source_url": "https://www.flickr.com/photos/17425845@N00/437341128"
  },
  "kits": {
    "author": "oomlout",
    "license": "CC BY-SA 2.0",
    "source_url": "https://commons.wikimedia.org/wiki/File:ARDX_-_Arduino_Experimentation_Kit_(Inside_the_box).jpg"
  }
};
