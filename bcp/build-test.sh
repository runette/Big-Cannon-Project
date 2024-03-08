ng build --configuration itest --output-path=../dist --aot --base-href=/ --build-optimizer $1
cd src/workbox
npx webpack ./swtemplate.ts  --config webpack.config
workbox injectManifest