"""Download public CDN images already referenced by the local MMT UI clone."""
from __future__ import annotations

import os
import ssl
import time
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent / "public" / "assets"
CTX = ssl.create_default_context()

ASSETS = {
    "favicon.ico": "https://imgak.mmtcdn.com/pwa_v3/pwa_commons_assets/favicon.ico",
    "sprites/header-sprite.png": "https://imgak.mmtcdn.com/pwa_v3/pwa_commons_assets/desktop/B2CHeaderSprite@2.png",
    "sprites/header-sprite-1x.png": "https://imgak.mmtcdn.com/pwa_v3/pwa_commons_assets/desktop/B2CHeaderSprite@1.png",
    "sprites/landing-sprite.png": "https://imgak.mmtcdn.com/pwa_v3/pwa_commons_assets/desktop/landingSprite@30x.png",
    "sprites/landing-sprite-2.png": "https://imgak.mmtcdn.com/pwa_v3/pwa_commons_assets/desktop/landingSprite2@3x.png",
    "sprites/flag-sprite.png": "https://imgak.mmtcdn.com/pwa_v3/pwa_commons_assets/desktop/flagSprite4.png",
    "bg/bg5.jpg": "https://imgak.mmtcdn.com/pwa_v3/pwa_commons_assets/desktop/bg5.jpg",
    "bg/bg2.jpg": "https://imgak.mmtcdn.com/pwa_v3/pwa_commons_assets/desktop/bg2.jpg",
    "logos/mmt-logo.png": "https://promos.makemytrip.com/Growth/Images/1x/mmt_dt_top_icon.png",
    "logos/mmt-logo-dark.png": "https://promos.makemytrip.com/Growth/Images/3x/mmt_dt_header_icon_3x.png",
    "logos/mybiz.png": "https://go-assets.ibcdn.com/u/MMT/images/1769594381486-myBizLogoWhiteBig.png",
    "explore/where2go.png": "https://promos.makemytrip.com/appfest/1x/ic_home_tertiary_where2go.png",
    "explore/how2go.png": "https://promos.makemytrip.com/appfest/1x/ic_home_tertiary_howtogo.png",
    "explore/travelcard.png": "https://promos.makemytrip.com/appfest/1x/ic_home_tertiary_travelcard.png",
    "explore/mice.png": "https://promos.makemytrip.com/appfest/1x/ic_home_tertiary_mice.png",
    "explore/giftcards.png": "https://promos.makemytrip.com/appfest/1x/ic_home_tertiary_giftcards.png",
    "app/qr.png": "https://promos.makemytrip.com/Growth/Images/B2C/dt_app_download_qr.png",
    "app/google-play.webp": "https://promos.makemytrip.com/appfest/1x/google-play-badge.webp",
    "app/app-store.webp": "https://promos.makemytrip.com/appfest/1x/ic-homefooter-app-store.webp",
    "promo/homestays.png": "https://promos.makemytrip.com/appfest/2x/BrandCampaign-icon-03Aug.png",
    "promo/onecircle.png": "https://promos.makemytrip.com/appfest/2x/One-circle-icon.png",
    "promo/tours.png": "https://promos.makemytrip.com/appfest/2x/Tours-icon.png",
    "promo/visa.png": "https://promos.makemytrip.com/notification/xhdpi/visa-circle-10042025.png",
    "offers/business-class.jpg": "https://promos.makemytrip.com/appfest/2x/Business-class-DT.jpg",
    "offers/airindia.jpg": "https://promos.makemytrip.com/appfest/2x/116X116-airindia-15092026.jpg",
    "offers/indusind.jpg": "https://promos.makemytrip.com/appfest/2x/indusind-116x116-20032026.jpg",
    "offers/qatar.jpg": "https://promos.makemytrip.com/appfest/2x/116X116-qatar-15092026.jpg",
    "offers/lakshadweep.jpg": "https://promos.makemytrip.com/appfest/2x/Desktop-Lakshadweep-27Aug.jpg",
    "offers/oyo.jpg": "https://promos.makemytrip.com/appfest/2x/116X116-oyo-15052026.jpg",
    "offers/airasia.jpg": "https://promos.makemytrip.com/appfest/2x/airasia-116x116-14092026.jpg",
    "offers/japan.jpg": "https://promos.makemytrip.com/notification/xhdpi/116X116-japan-airline-01042024.jpg",
    "offers/gulf.jpg": "https://promos.makemytrip.com/notification/xhdpi/gulf-air-116x116-13102023.jpg",
    "offers/ibis.jpg": "https://promos.makemytrip.com/appfest/2x/ibis-116x116-13072026.jpg",
    "offers/lastminute.jpg": "https://promos.makemytrip.com/appfest/2x/Desktop-LastMinute-Common-30June.jpg",
    "offers/visa-hotels.jpg": "https://promos.makemytrip.com/appfest/2x/visa-116x116-310082026.jpg",
    "offers/phuquoc.jpg": "https://promos.makemytrip.com/appfest/2x/Desktop-PhuQuoc-23Mar.jpg",
    "offers/disney.jpg": "https://promos.makemytrip.com/appfest/2x/DisneyCruise-Desktop-11Mar.jpg",
    "offers/trains.jpg": "https://promos.makemytrip.com/appfest/2x/Desktop-Trains-Festive-1Sep.jpg",
    "offers/black-train.jpg": "https://promos.makemytrip.com/images/Desktop-blackXTrain-17Jan.jpg",
    "offers/seat-forecast.jpg": "https://promos.makemytrip.com/images/Desktop-SeatAvailability-24Jun.jpg",
    "offers/hr-cab.jpg": "https://promos.makemytrip.com/appfest/2x/Desktop-HRcab-13Apr.jpg",
    "offers/os-cab.jpg": "https://promos.makemytrip.com/images/Desktop-OsCab-Routes-12Sep.jpg",
    "offers/ahm-vad.jpg": "https://promos.makemytrip.com/images/Desktop-Ahm-Vad-8May.jpg",
    "offers/icici-if.jpg": "https://promos.makemytrip.com/notification/xhdpi/116X116-icici-if-05022024.jpg",
    "offers/icici-ih.jpg": "https://promos.makemytrip.com/notification/xhdpi/116X116-icici-ih-13102023.jpg",
    "offers/hdfc.jpg": "https://promos.makemytrip.com/notification/xhdpi/116X116-hdfc-31012025_updated.jpg",
    "collections/delhi.jpg": "https://hblimg.mmtcdn.com/content/hubble/img/delhi_hotels_tiow/mmt/activities/m_Le%20ROI%20Floating%20Huts_Eco%20Rooms_Tehri_Uttarakhand_l_550_821.jpg",
    "collections/mumbai.jpg": "https://hblimg.mmtcdn.com/content/hubble/img/seo_img/mmt/activities/m_Radisson_blu_image_seo_l_550_821.jpg",
    "collections/bangalore.jpg": "https://hblimg.mmtcdn.com/content/hubble/img/bangalore_hotel_tiow/mmt/activities/m_Waterwoods%20Lodges%20%26%20Resorts_Kabini_l_550_821.jpg",
    "collections/beach.jpg": "https://hblimg.mmtcdn.com/content/hubble/img/collections/m_beach44_p_540_417.jpg",
    "collections/hills.jpg": "https://hblimg.mmtcdn.com/content/hubble/img/collections/m_hill_stations11_p_540_417.jpg",
    "destinations/narkanda.jpg": "https://hblimg.mmtcdn.com/content/hubble/img/narkanda/mmt/destination/m_Narkanda_l_372_902.jpg",
    "destinations/yercaud.jpg": "https://hblimg.mmtcdn.com/content/hubble/img/yercaud/mmt/destination/m_destination-yercaud-landscape_l_400_640.jpg",
    "destinations/dooars.jpg": "https://hblimg.mmtcdn.com/content/hubble/img/dooars/mmt/destination/m_Dooars_l_457_685.jpg",
    "destinations/saputara.jpg": "https://hblimg.mmtcdn.com/content/hubble/img/saputara/mmt/destination/m_destination-saputara-landscape_l_400_640.jpg",
    "destinations/mandarmani.jpg": "https://hblimg.mmtcdn.com/content/hubble/img/mandarmani/mmt/destination/m_destination-mandarmoni-landscape_l_400_640.jpg",
}

UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"


def fetch(url: str, dest: Path) -> str:
    dest.parent.mkdir(parents=True, exist_ok=True)
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept": "image/*,*/*"})
    with urllib.request.urlopen(req, context=CTX, timeout=40) as res:
        data = res.read()
        dest.write_bytes(data)
    return f"OK {len(data):>8}  {dest.relative_to(ROOT.parent)}"


def main() -> None:
    ROOT.mkdir(parents=True, exist_ok=True)
    ok = fail = 0
    for rel, url in ASSETS.items():
        dest = ROOT / rel if rel != "favicon.ico" else ROOT.parent / "favicon.ico"
        try:
            print(fetch(url, dest))
            ok += 1
        except Exception as exc:
            print(f"FAIL {rel}: {exc}")
            fail += 1
        time.sleep(0.05)
    print(f"\nDone. ok={ok} fail={fail}")


if __name__ == "__main__":
    main()
