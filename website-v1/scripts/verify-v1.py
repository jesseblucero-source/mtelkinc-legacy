"""Compatibility entry point; V1 remains available under the v1.0.0 Git tag."""
from pathlib import Path
import runpy
runpy.run_path(str(Path(__file__).with_name('verify-release.py')),run_name='__main__')
