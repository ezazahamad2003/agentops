"""
Setup configuration for AgentOps SDK.

Install with: pip install -e .
"""

from setuptools import setup, find_packages

with open("README.md", "r", encoding="utf-8") as fh:
    long_description = fh.read()

setup(
    name="agentops-client",
    version="0.2.0",
    author="Ezaz Ahmad",
    author_email="ezazahamad2003@gmail.com",
    description="AI Reliability Engineering for LLM Agents - Monitor hallucinations, latency, and throughput",
    long_description=long_description,
    long_description_content_type="text/markdown",
    url="https://github.com/ezazahamad2003/agentops",
    project_urls={
        "Bug Tracker": "https://github.com/ezazahamad2003/agentops/issues",
        "Documentation": "https://github.com/ezazahamad2003/agentops#readme",
        "Source Code": "https://github.com/ezazahamad2003/agentops",
    },
    license="MIT",
    packages=find_packages(),
    classifiers=[
        "Development Status :: 4 - Beta",
        "Intended Audience :: Developers",
        "Topic :: Software Development :: Libraries :: Python Modules",
        "Topic :: Scientific/Engineering :: Artificial Intelligence",
        "License :: OSI Approved :: MIT License",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.8",
        "Programming Language :: Python :: 3.9",
        "Programming Language :: Python :: 3.10",
        "Programming Language :: Python :: 3.11",
        "Programming Language :: Python :: 3.12",
        "Programming Language :: Python :: 3.13",
    ],
    python_requires=">=3.8",
    install_requires=[
        "openai>=1.12.0",
        "python-dotenv>=1.0.0",
        "numpy>=1.24.0",
        "httpx>=0.26.0",
        "loguru>=0.7.2",
    ],
    extras_require={
        "dev": [
            "pytest>=7.4.0",
            "black>=23.0.0",
            "flake8>=6.0.0",
        ],
    },
    keywords=["llm", "ai", "monitoring", "hallucination", "observability", "agents", "reliability"],
)

