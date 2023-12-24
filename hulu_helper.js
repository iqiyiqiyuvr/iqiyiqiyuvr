/*
@decription: Hulu iOS 去广告插件
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
        }
        else {
            body = body.replace(/(?:#EXT-X-DISCONTINUITY\s+)?#EXT-X-BYTERANGE:\d+@\d+\s+(?:#EXT-X-KEY:METHOD=NONE\s+)?#EXT-X-MAP:URI="https:\/\/ads-[\s\S]*?#EXT-X-DISCONTINUITY\s+(#EXT-X-BYTERANGE:\d+@\d+\s+#EXT-X-KEY:METHOD=SAMPLE-AES,)/g, '\r\n$1')
        }

        $.done({ body: body })
    }

    $.done()
})()

function Env(t, e) {
    class s {
        constructor(t) {
            this.env = t
        }

        send(t, e = 'GET') {
            t = 'string' == typeof t ? { url: t } : t
            const s = this.get
            return new Promise((e, i) => {
                s.call(this, t, (t, s, r) => {
                    t ? i(t) : e(s)
                })
            })
        }

        get(t) {
            return this.send.call(this.env, t)
        }

        post(t) {
            return this.send.call(this.env, t, 'POST')
        }
    }

    return new (class {
        constructor(t, e) {
            this.function = t, this.env = e
        }

        log(...t) {
            this.env && this.env.log(...t)
        }

        info(...t) {
            this.env && this.env.info(...t)
        }

        error(...t) {
            this.env && this.env.error(...t)
        }

        wait(t) {
            return new Promise(e => setTimeout(e, t))
        }

        done(t = {}) {
            this.env ? this.env.done(t) : void 0
        }

        get(t) {
            const e = this.function
            return new Promise(s => {
                e.call(
                    this,
                    t,
                    (t, i, r) => {
                        t ? this.error(t) : this.log(i), s(i)
                    },
                    e
                )
            })
        }

        post(t) {
            const e = this.function
            return new Promise(s => {
                e.call(
                    this,
                    t,
                    (t, i, r) => {
                        t ? this.error(t) : this.log(i), s(i)
                    },
                    'POST'
                )
            })
        }
    })(s, e)
}
