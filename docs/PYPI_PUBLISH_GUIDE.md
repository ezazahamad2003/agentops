# 📦 Publishing AgentOps to PyPI

## ✅ Package Built Successfully!

Your distribution files are ready in `dist/`:
- `agentops-0.2.0-py3-none-any.whl` - Wheel package
- `agentops-0.2.0.tar.gz` - Source distribution

## 🚀 Step-by-Step Publishing Guide

### Step 1: Create PyPI Account

1. **Test PyPI (Recommended First)**
   - Go to https://test.pypi.org/account/register/
   - Create an account
   - Verify your email

2. **Real PyPI**
   - Go to https://pypi.org/account/register/
   - Create an account
   - Verify your email

### Step 2: Create API Token

**For Test PyPI:**
1. Log in to https://test.pypi.org
2. Go to Account Settings → API tokens
3. Click "Add API token"
4. Name: "agentops-upload"
5. Scope: "Entire account" (or specific project after first upload)
6. Copy the token (starts with `pypi-...`)

**For Real PyPI:**
1. Same process at https://pypi.org

### Step 3: Configure Credentials

Create/edit `~/.pypirc` file:

```ini
[distutils]
index-servers =
    pypi
    testpypi

[pypi]
username = __token__
password = pypi-YOUR_REAL_PYPI_TOKEN_HERE

[testpypi]
repository = https://test.pypi.org/legacy/
username = __token__
password = pypi-YOUR_TEST_PYPI_TOKEN_HERE
```

**On Windows**, the file location is:
`C:\Users\{your_username}\.pypirc`

### Step 4: Upload to Test PyPI (Recommended)

```bash
# Upload to Test PyPI first
twine upload --repository testpypi dist/*

# You'll see output like:
# Uploading distributions to https://test.pypi.org/legacy/
# Uploading agentops-0.2.0-py3-none-any.whl
# Uploading agentops-0.2.0.tar.gz
```

### Step 5: Test Installation from Test PyPI

```bash
# Create a test environment
python -m venv test_env
test_env\Scripts\activate  # Windows
# or: source test_env/bin/activate  # Linux/Mac

# Install from Test PyPI
pip install --index-url https://test.pypi.org/simple/ --extra-index-url https://pypi.org/simple agentops

# Test it works
python -c "from agentops import AgentOps; print('✅ AgentOps imported successfully!')"
```

**Note**: `--extra-index-url https://pypi.org/simple` is needed because dependencies (openai, numpy) aren't on Test PyPI.

### Step 6: Upload to Real PyPI

Once tested successfully:

```bash
# Upload to real PyPI
twine upload dist/*

# You'll see:
# Uploading distributions to https://upload.pypi.org/legacy/
# Uploading agentops-0.2.0-py3-none-any.whl
# Uploading agentops-0.2.0.tar.gz
# View at: https://pypi.org/project/agentops/0.2.0/
```

### Step 7: Verify Public Installation

```bash
# Anyone can now install with:
pip install agentops

# Test it:
python -c "from agentops import AgentOps; ops = AgentOps(); print('🎉 AgentOps v0.2.0')"
```

## 📝 Common Issues & Solutions

### Issue 1: "The user '<username>' isn't allowed to upload"

**Solution**: Use API token instead of username/password in `.pypirc`:
```ini
username = __token__
password = pypi-YOUR_TOKEN_HERE
```

### Issue 2: "File already exists"

**Solution**: You can't re-upload the same version. Either:
- Delete the package version from PyPI (if just testing)
- Increment version in `pyproject.toml` and rebuild:
  ```toml
  version = "0.2.1"
  ```
  Then: `python -m build`

### Issue 3: "Invalid distribution"

**Solution**: Check README.md encoding:
```bash
# Re-encode README
Get-Content README.md -Encoding UTF8 | Set-Content README.md -Encoding UTF8
```

## 🎯 Quick Commands Summary

```bash
# Build
python -m build

# Upload to Test PyPI
twine upload --repository testpypi dist/*

# Test install
pip install --index-url https://test.pypi.org/simple/ --extra-index-url https://pypi.org/simple agentops

# Upload to Real PyPI
twine upload dist/*

# Public install
pip install agentops
```

## 🔐 Security Tips

1. **Never commit `.pypirc` to git** - it contains your API tokens
2. **Use API tokens** instead of passwords
3. **Create project-scoped tokens** after first upload for better security
4. **Rotate tokens periodically**

## 📊 After Publishing

Once published to PyPI, your package will be available at:
- **PyPI Page**: https://pypi.org/project/agentops/
- **Install command**: `pip install agentops`

### Update Your README

Update installation instructions to:
```markdown
## Installation

```bash
pip install agentops
```
```

### Create a Release on GitHub

1. Go to https://github.com/ezazahamad2003/agentops/releases
2. Click "Create a new release"
3. Tag: `v0.2.0`
4. Title: "AgentOps v0.2.0 - SDK Release"
5. Description: Link to CHANGELOG.md
6. Attach dist files (optional)

## 🎉 Success Checklist

- [ ] Package name "agentops" is available on PyPI
- [ ] Created Test PyPI account
- [ ] Created Real PyPI account
- [ ] Generated API tokens
- [ ] Configured `.pypirc` file
- [ ] Built distribution (`dist/` folder exists)
- [ ] Uploaded to Test PyPI
- [ ] Tested installation from Test PyPI
- [ ] Uploaded to Real PyPI
- [ ] Verified public installation works
- [ ] Updated GitHub README with PyPI badge
- [ ] Created GitHub release

## 🏆 You're Ready!

Run the following to publish:

```bash
# Test first
twine upload --repository testpypi dist/*

# Then real
twine upload dist/*
```

---

**Need help?** Check:
- PyPI documentation: https://packaging.python.org/tutorials/packaging-projects/
- Twine docs: https://twine.readthedocs.io/

