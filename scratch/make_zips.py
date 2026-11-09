import os
import zipfile

BASE_DIR = r"C:\Users\heman\.gemini\antigravity\scratch\nizami-biryani"

# 1. Company_A_Submission_Docs.zip (Strictly submission files)
docs_zip_path = os.path.join(BASE_DIR, "Company_A_Submission_Docs.zip")
with zipfile.ZipFile(docs_zip_path, 'w', zipfile.ZIP_DEFLATED) as zf:
    zf.write(os.path.join(BASE_DIR, "Company_A_TDD.pdf"), "Company_A_TDD.pdf")
    zf.write(os.path.join(BASE_DIR, "Company_A_TDD.docx"), "Company_A_TDD.docx")
    zf.write(os.path.join(BASE_DIR, "deployment.md"), "deployment.md")
    zf.write(os.path.join(BASE_DIR, "README.md"), "README.md")
print(f"✅ Generated docs zip: {docs_zip_path} ({os.path.getsize(docs_zip_path) / 1024:.1f} KB)")

# 2. submission.zip (Full bundle)
full_zip_path = os.path.join(BASE_DIR, "submission.zip")
exclude_dirs = {'.git', 'node_modules', '.vscode'}
exclude_files = {'submission.zip', 'Company_A_Submission_Docs.zip'}

with zipfile.ZipFile(full_zip_path, 'w', zipfile.ZIP_DEFLATED) as zf:
    for root, dirs, files in os.walk(BASE_DIR):
        dirs[:] = [d for d in dirs if d not in exclude_dirs]
        for f in files:
            if f in exclude_files:
                continue
            full_path = os.path.join(root, f)
            arcname = os.path.relpath(full_path, BASE_DIR)
            zf.write(full_path, arcname)
print(f"✅ Generated full submission bundle: {full_zip_path} ({os.path.getsize(full_zip_path) / 1024:.1f} KB)")
