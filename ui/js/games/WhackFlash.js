/*
    This file is part of MGC and is licensed under the MIT License.
    See the LICENSE file in the root directory for full terms.

    © 2025 Case @ Playing In Traffic

    Support honest development - retain this credit. Don't be that guy...
*/

export default class WhackFlash {
    constructor() {
        this.config = {
            total_hits: 10,
            max_misses: 3,
            flash_duration: 1000
        };

        this.hits = 0;
        this.misses = 0;
        this.current_index = null;
        this.timeout = null;
        this.ready = false;
    }

    async init(data) {
        this.config = { ...this.config, ...data };
        this.build_ui();
        this.start_countdown();
    }

    build_ui() {
        const html = `
            <div class="minigame_container whack_flash">
                <div class="minigame_header">
                    <div class="minigame_timer">
                        Hits: <span id="whack_hits">0</span> | Misses: <span id="whack_misses">0</span>
                    </div>
                    <div id="whack_countdown" class="whack_countdown" style="margin-right: 0.5vh;">3</div>
                </div>
                <div class="whack_grid">
                    <div class="whack_row row3">
                        ${[0, 1, 2].map(i => `<div class="whack_circle" data-index="${i}"></div>`).join('')}
                    </div>
                    <div class="whack_row row4">
                        ${[3, 4, 5, 6].map(i => `<div class="whack_circle" data-index="${i}"></div>`).join('')}
                    </div>
                    <div class="whack_row row3">
                        ${[7, 8, 9].map(i => `<div class="whack_circle" data-index="${i}"></div>`).join('')}
                    </div>
                </div>
            </div>
        `;
        $("#main_container").html(html);
    }

    start_countdown() {
        const countdownEl = $("#whack_countdown");
        let count = 3;
        countdownEl.text(count).show();

        const interval = setInterval(() => {
            count--;
            if (count > 0) {
                countdownEl.text(count);
            } else if (count === 0) {
                countdownEl.text("GO!");
            } else {
                clearInterval(interval);
                countdownEl.fadeOut(300, () => {
                    this.ready = true;
                    this.bind_events();
                    this.next_flash();
                });
            }
        }, 1000);
    }

    bind_events() {
        $(".whack_circle").on("click", (e) => {
            if (!this.ready) return;
            const idx = parseInt($(e.target).data("index"));
            if (idx === this.current_index) {
                this.hits++;
                $(e.target).addClass("success");
            } else {
                this.misses++;
                $(e.target).addClass("fail");
            }
            this.update_stats();
            this.next_flash();
        });
    }

    next_flash() {
        clearTimeout(this.timeout);
        $(".whack_circle").removeClass("active success fail");

        if (this.hits >= this.config.total_hits) return this.end_game(true);
        if (this.misses >= this.config.max_misses) return this.end_game(false);

        this.current_index = Math.floor(Math.random() * 10);
        const el = $(`.whack_circle[data-index=${this.current_index}]`);
        el.addClass("active");

        this.timeout = setTimeout(() => {
            if (!el.hasClass("success")) {
                el.addClass("fail");
                this.misses++;
                this.update_stats();
                this.next_flash();
            }
        }, this.config.flash_duration);
    }

    update_stats() {
        $("#whack_hits").text(this.hits);
        $("#whack_misses").text(this.misses);
    }

    end_game(success) {
        $(".whack_circle").off("click");
        const result = success ? "SUCCESS" : "FAILED";
        const html = `
            <div class="minigame_container pulse_sync">
                <div class="minigame_result_screen">${result}</div>
            </div>
        `;
        $("#main_container").html(html);

        setTimeout(() => {
            $("#main_container").empty();
            $.post(`https://${GetParentResourceName()}/minigame_result`, JSON.stringify({ game: "whack_flash", success }));
        }, 2000);
    }
}
