# -*- coding: utf-8 -*-
"""
fix_broken_images.py
Replaces every broken image reference in src/ with a working equivalent.
"""
import os

project_root = r"C:\Users\Alexandre\.gemini\antigravity\scratch\XzenpressManus-GitHub"
src_dir = os.path.join(project_root, "src")

# ---------------------------------------------------------------------------
# Replacement map: broken image path -> working replacement
# All replacements verified to exist in /public
# ---------------------------------------------------------------------------
REPLACEMENTS = {
    # Ren / abdominal points
    "/CV3_Zhongji.jpg":           "/Ren_Abdominal_Points.png",
    "/CV4_Guanyuan.jpg":          "/Ren_Abdominal_Points.png",
    "/Ren6_Qihai.jpg":            "/Ren_Abdominal_Points.png",

    # Shenshu / BL23
    "/BL23_Shenshu.jpg":          "/BL23_Shenshu_User_Correct.png",

    # BP4 / Gongsun
    "/BP4_Gongsun.jpg":           "/BP4_Gongsun_New.png",

    # BP6 / Sanyinjiao (old .jpg -> existing .png)
    "/BP6_Sanyinjiao.jpg":        "/BP6_Sanyinjiao.png",

    # GB20 / Fengchi – use existing head/neck map
    "/GB20_Fengchi.jpg":          "/GV20 Baihui.jpg",

    # GB34 / Yanglingquan – several spellings
    "/GB34_Yanglingquan.png":     "/VB34_Yanglingquan_New.png",
    "/gb34-yanglingquan.jpg":     "/VB34_Yanglingquan_New.png",
    "/gb34_leg.jpg":              "/VB_Leg_Points_Map.jpg",

    # KD3 / Taixi
    "/KD3_Taixi.jpg":             "/KD3_Taixi.png",

    # LV2 / Xingjian
    "/LV2_Ref.png":               "/LV2_Xingjian_User_Correct.png",

    # YNSA images
    "/YNSA/ynsa-ypsilon-points.jpg":    "/YNSA/ynsa-basic-points-master.png",
    "/ynsa-ypsilon-temple.jpg":         "/YNSA/ynsa-basic-points-master.png",
    "/ynsa_basic_points.jpg":           "/YNSA/ynsa-basic-points-master.png",
    "/ynsa_gallbladder.jpg":            "/YNSA/ynsa-frontal-complete.png",
    "/uploaded_media_1770049739813.png":"/YNSA/ynsa-basic-points-master.png",

    # Misc
    "/bl14-jueyinshu.jpg":        "/huatuo-t4.jpg",
    "/r1_foot.jpg":               "/R1 Acalma a mente, Vertigem, Tontura Agita\u00e7\u00e3o.jpg",
    "/sj6_arm.jpg":               "/sj6-zhigou.jpg",
}

skip_files = {"acupressurePoints.bak.ts"}
ext_ok = {".ts", ".tsx"}

changed_files = 0
total_replacements = 0

for root, dirs, files in os.walk(src_dir):
    for fname in files:
        ext = os.path.splitext(fname)[1]
        if ext not in ext_ok:
            continue
        if fname in skip_files or ".bak." in fname:
            continue
        fpath = os.path.join(root, fname)
        with open(fpath, "r", encoding="utf-8", errors="ignore") as fh:
            content = fh.read()

        new_content = content
        for broken, fixed in REPLACEMENTS.items():
            if broken in new_content:
                count = new_content.count(broken)
                new_content = new_content.replace(broken, fixed)
                rel = fpath.replace(project_root + "\\", "")
                print(f"  [{count}x] {broken}  ->  {fixed}  ({rel})")
                total_replacements += count

        if new_content != content:
            with open(fpath, "w", encoding="utf-8") as fh:
                fh.write(new_content)
            changed_files += 1

print(f"\nDone. {total_replacements} replacements in {changed_files} files.")
