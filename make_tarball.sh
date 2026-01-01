cd packages
rm -f ffmpeg-core.tgz
rm -f ffmpeg-core-mt.tgz
rm -f ffmpeg-ffmpeg.tgz
rm -f ffmpeg-types.tgz
rm -f ffmpeg-util.tgz
tar zcvf ffmpeg-core.tgz core/package.json core/dist
tar zcvf ffmpeg-core-mt.tgz core-mt/package.json core-mt/dist
tar zcvf ffmpeg-ffmpeg.tgz ffmpeg/package.json ffmpeg/dist
tar zcvf ffmpeg-types.tgz types/package.json types/types
tar zcvf ffmpeg-util.tgz util/package.json util/dist

