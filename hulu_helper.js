/*
@description: Hulu iOS 去广告插件
@created: 2022-11-26
@updated: 2023-09-06
*/

(async () => {
    const $ = Env("hulu_helper.js")

    if (/\/hulu\/v\d+\/hls\/(video|audio)\/\d+\//.test($request.url)) {
        // remove ad
        let body = $response.body
        const is_video = !body.includes('_audio.mp4?')

        if (is_video) {
            body = body.replace(/#EXT-X-DATERANGE:ID="\d+",.*?X-COM-HULU-CONTENT-MANIFEST-PERIOD-TYPE-\d+="(?:bumper|ad)"[\s\S]*?(#EXT-X-DATERANGE:ID="\d+",.*?X-COM-HULU-CONTENT-MANIFEST-PERIOD-TYPE-\d+="content".*?\s+)#EXT-X-DISCONTINUITY\s+/g, '\r\n$1')
        } else {
            body = body.replace(/(?:#EXT-X-DISCONTINUITY\s+)?#EXT-X-BYTERANGE:\d+@\d+\s+(?:#EXT-X-KEY:METHOD=NONE\s+)?#EXT-X-MAP:URI="https:\/\/ads-[\s\S]*?#EXT-X-DISCONTINUITY\s+(#EXT-X-BYTERANGE:\d+@\d+\s+#EXT-X-KEY:METHOD=SAMPLE-AES,)/g, '\r\n$1')
        }

        $.done({ body: body })
    }
})();
