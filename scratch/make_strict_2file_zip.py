import os
import zipfile

BASE_DIR = r"C:\Users\heman\.gemini\antigravity\scratch\nizami-biryani"
DOWNLOADS_DIR = r"C:\Users\heman\Downloads"

tdd_pdf = os.path.join(BASE_DIR, "Company_A_TDD.pdf")
deployment_md = os.path.join(BASE_DIR, "deployment.md")

zip_targets = [
    os.path.join(BASE_DIR, "Company_A_Submission.zip"),
    os.path.join(BASE_DIR, "Company_A_Submission_Docs.zip"),
    os.path.join(DOWNLOADS_DIR, "Company_A_Submission.zip"),
    os.path.join(DOWNLOADS_DIR, "Company_A_Submission_Docs_Final.zip")
]

for target in zip_targets:
    with zipfile.ZipFile(target, 'w', zipfile.ZIP_DEFLATED) as zf:
        zf.write(tdd_pdf, "Company_A_TDD.pdf")
        zf.write(deployment_md, "deployment.md")
    print(f"Created 2-file zip: {target} ({os.path.getsize(target)/1024:.1f} KB)")

# Verify contents
with zipfile.ZipFile(os.path.join(BASE_DIR, "Company_A_Submission.zip"), 'r') as zf:
    print("\nVerified ZIP contents (strictly 2 files):")
    for info in zf.infolist():
        print(f" - {info.filename} ({info.file_size / 1024:.1f} KB uncompressed)")
