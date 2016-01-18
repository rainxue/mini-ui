echo remove dist
rd /s /q dist

echo begin rebuild
broccoli build dist

echo rebuild success