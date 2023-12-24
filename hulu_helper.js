/*
@author: liunice
@decription: Hulu iOS 去广告插件
@created: 2022-11-26
@updated: 2023-09-06
*/

/*
本插件与DualSubs字幕插件可能存在冲突，请按需启用。

项目主页: https://github.com/liunice/HuluHelper
TG官方群: https://t.me/+W6aJJ-p9Ir1hNmY1

QuanX用法：
hostname = discover.hulu.com, vodmanifest.hulustream.com

以下功能请按需启用：

# 去广告
^https:\/\/vodmanifest\.hulustream\.com\/hulu\/v\d+\/hls\/(video|audio)\/\d+\/ url script-response-body https://raw.githubusercontent.com/liunice/HuluHelper/master/hulu_helper.js
^https:\/\/vodmanifest\.hulustream\.com\/hulu\/v\d+\/hls\/vtt\/\d+\/playlist\.m3u8 url script-response-body https://raw.githubusercontent.com/liunice/HuluHelper/master/hulu_helper.js
*/

(async () => {
    const $ = Env("hulu_helper.js")

    if (/\/hulu\/v\d+\/hls\/(video|audio)\/\d+\//.test($request.url)) {
        // remove ad
        let body = $response.body

        const is_video = !body.includes('_audio.mp4?')

        if (is_video) {
            body = body.replace(/#EXT-X-DATERANGE:ID="\d+",.*?X-COM-HULU-CONTENT-MANIFEST-PERIOD-TYPE-\d+="(?:bumper|ad)"[\s\S]*?(#EXT-X-DATERANGE:ID="\d+",.*?X-COM-HULU-CONTENT-MANIFEST-PERIOD-TYPE-\d+="content".*?\s+)#EXT-X-DISCONTINUITY\s+/g, '\r\n$1')
        }
        else {
            body = body.replace(/(?:#EXT-X-DISCONTINUITY\s+)?#EXT-X-BYTERANGE:\d+@\d+\s+(?:#EXT-X-KEY:METHOD=NONE\s+)?#EXT-X-MAP:URI="https:\/\/ads-[\s\S]*?#EXT-X-DISCONTINUITY\s+(#EXT-X-BYTERANGE:\d+@\d+\s+#EXT-X-KEY:METHOD=SAMPLE-AES,)/g, '\r\n$1')
        }

        $.done({ body: body })
    }
    else if (/\/hulu\/v\d+\/hls\/vtt\/\d+\/playlist\.m3u8/.test($request.url)) {
        // save manifest for sub syncer
        if (getSubtitleConfig('subsyncer.enabled') == 'true') {
            writeSubSyncerDB($request.url)
        }

        // rewrite subtitle
        if (checkSubtitleExists()) {
            // redirect to external srt subtitle
            const body = `#EXTM3U
#EXT-X-VERSION:6
#EXT-X-PLAYLIST-TYPE:VOD
#EXT-X-MEDIA-SEQUENCE:0
#EXT-X-TARGETDURATION:36000
#EXTINF:36000.000,
https://vodmanifest.hulustream.com/subtitles/dummy.vtt
#EXT-X-ENDLIST
`
            $.done({ body: body })
        }
        else {
            // use original cc subtitle (need to remove ad subtitle)
            const parts = [...$response.body.matchAll(/#EXTINF:\d+.*?\s+http:\/\/assets\.huluim\.com\/captions_webvtt\/(?!blank).*?\.vtt/g)].map(s => s[0])
            const body = `#EXTM3U
#EXT-X-TARGETDURATION:30
#EXT-X-VERSION:3
#EXT-X-MEDIA-SEQUENCE:0
#EXT-X-PLAYLIST-TYPE:VOD
${parts.join('\n')}
#EXT-X-ENDLIST
`
            $.done({ body: body })
        }
    }
    else {
        // For other URLs, just pass through the response
        $.done({})
    }
})();
