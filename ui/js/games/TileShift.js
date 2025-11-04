/*
    This file is part of MGC and is licensed under the MIT License.
    See the LICENSE file in the root directory for full terms.

    © 2025 Case @ Playing In Traffic

    Support honest development - retain this credit. Don't be that guy...
*/

export default class TileShift {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.grid_size = 3;
        this.grid = [];
        this.empty_tile = { x: 2, y: 2 };
        this.target_grid = [];
        this.tile_size = 0;
        this.timer = null;
        this.remaining = 15000;
        this.success = false;
        this.preview_time = 2000;
        this.config = {
            timer: 15000,
            grid_size: 3,
            scramble_moves: 30,
            preview: true
        };
        this.audio = {
            success: "assets/audio/succeeded.ogg",
            failed: "assets/audio/system_fault.ogg",
            low_time: "assets/audio/beep.ogg",
            volume: 0.2
        };
    }

    async init(data) {
        await document.fonts.load("12px 'VT323'");
        this.config = { ...this.config, ...data };
        this.grid_size = this.config.grid_size;
        this.remaining = this.config.timer;
        this.build_ui();
    }

    build_ui() {
        const content = `
            <div class="minigame_container data_shift">
                <div class="minigame_header">
                    <div class="minigame_timer">Time Remaining: ${Math.floor(this.remaining / 1000)}s</div>
                </div>
                <div class="trace_canvas_wrapper">
                    <canvas id="trace_canvas" style="width: auto; height: 100%; aspect-ratio: 1 / 1; display: block;"></canvas>

                </div>
            </div>
        `;
        $("#main_container").html(content);

        this.canvas = document.getElementById("trace_canvas");
        const rect = this.canvas.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
        this.ctx = this.canvas.getContext("2d");

        this.tile_size = Math.min(this.canvas.width, this.canvas.height) / this.grid_size;

        this.generate_grid();
        this.draw(true);

        setTimeout(() => {
            this.scramble_grid(this.config.scramble_moves);
            this.draw();
            this.start_timer();
            this.bind_events();
        }, this.config.preview ? this.preview_time : 0);
    }

    generate_grid() {
        this.grid = [];
        this.target_grid = [];
        let n = 1;

        for (let y = 0; y < this.grid_size; y++) {
            this.target_grid[y] = [];
            for (let x = 0; x < this.grid_size; x++) {
                this.target_grid[y][x] = n++;
            }
        }
        const max = this.grid_size - 1;
        this.target_grid[max][max] = 0;

        this.grid = this.random_solvable_grid();
        this.find_empty_tile();
    }

    random_solvable_grid() {
        const arr = [];
        for (let i = 0; i < this.grid_size * this.grid_size; i++) arr.push(i);
        do {
            for (let i = arr.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [arr[i], arr[j]] = [arr[j], arr[i]];
            }
        } while (!this.is_solvable(arr));

        const grid = [];
        let index = 0;
        for (let y = 0; y < this.grid_size; y++) {
            grid[y] = [];
            for (let x = 0; x < this.grid_size; x++) {
                grid[y][x] = arr[index++];
            }
        }
        return grid;
    }

    find_empty_tile() {
        for (let y = 0; y < this.grid_size; y++) {
            for (let x = 0; x < this.grid_size; x++) {
                if (this.grid[y][x] === 0) {
                    this.empty_tile = { x, y };
                    return;
                }
            }
        }
    }

    is_solvable(array) {
        const inv_count = array.reduce((acc, curr, i) => {
            if (curr === 0) return acc;
            for (let j = i + 1; j < array.length; j++) {
                if (array[j] !== 0 && array[i] > array[j]) acc++;
            }
            return acc;
        }, 0);

        if (this.grid_size % 2 !== 0) {
            return inv_count % 2 === 0;
        } else {
            const empty_row = Math.floor(array.indexOf(0) / this.grid_size);
            const from_bottom = this.grid_size - empty_row;
            if (from_bottom % 2 === 0) {
                return inv_count % 2 !== 0;
            } else {
                return inv_count % 2 === 0;
            }
        }
    }

    scramble_grid(moves) {
        const dirs = [
            { x: 0, y: -1 },
            { x: 1, y: 0 },
            { x: 0, y: 1 },
            { x: -1, y: 0 }
        ];

        for (let i = 0; i < moves; i++) {
            const valid = dirs.filter(dir => {
                const nx = this.empty_tile.x + dir.x;
                const ny = this.empty_tile.y + dir.y;
                return nx >= 0 && ny >= 0 && nx < this.grid_size && ny < this.grid_size;
            });
            const move = valid[Math.floor(Math.random() * valid.length)];
            const nx = this.empty_tile.x + move.x;
            const ny = this.empty_tile.y + move.y;
            [this.grid[this.empty_tile.y][this.empty_tile.x], this.grid[ny][nx]] = [this.grid[ny][nx], this.grid[this.empty_tile.y][this.empty_tile.x]];
            this.empty_tile = { x: nx, y: ny };
        }
    }

    draw(preview = false) {
        const ctx = this.ctx;
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        const grid = preview ? this.target_grid : this.grid;

        for (let y = 0; y < this.grid_size; y++) {
            for (let x = 0; x < this.grid_size; x++) {
                const val = grid[y][x];
                if (val === 0) continue;
                ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--accent4') || '#666';
                ctx.fillRect(x * this.tile_size + 4, y * this.tile_size + 4, this.tile_size - 8, this.tile_size - 8);
                ctx.fillStyle = '#fff';
                ctx.font = `${this.tile_size / 2}px VT323, monospace`;
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillText(val, x * this.tile_size + this.tile_size / 2, y * this.tile_size + this.tile_size / 2);
            }
        }
    }

    bind_events() {
        this.canvas.addEventListener("mousedown", (e) => {
            const pos = this.get_cursor_pos(e);
            const x = Math.floor(pos.x / this.tile_size);
            const y = Math.floor(pos.y / this.tile_size);
            if (this.is_adjacent(x, y, this.empty_tile.x, this.empty_tile.y)) {
                [this.grid[y][x], this.grid[this.empty_tile.y][this.empty_tile.x]] = [this.grid[this.empty_tile.y][this.empty_tile.x], this.grid[y][x]];
                this.empty_tile = { x, y };
                this.draw();
                if (this.check_win()) {
                    this.end_game(true);
                }
            }
        });
    }

    get_cursor_pos(e) {
        const rect = this.canvas.getBoundingClientRect();
        return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    }

    is_adjacent(x1, y1, x2, y2) {
        return (Math.abs(x1 - x2) + Math.abs(y1 - y2)) === 1;
    }

    check_win() {
        for (let y = 0; y < this.grid_size; y++) {
            for (let x = 0; x < this.grid_size; x++) {
                if (this.grid[y][x] !== this.target_grid[y][x]) return false;
            }
        }
        return true;
    }

    start_timer() {
        this.timer = setInterval(() => {
            this.remaining -= 1000;
            $(".minigame_timer").text(`Time Remaining: ${Math.floor(this.remaining / 1000)}s`);
            if (this.remaining <= 0) {
                clearInterval(this.timer);
                this.end_game(false);
            }
            if (this.remaining <= 5000) {
                $(".minigame_timer").css("color", "rgba(255,0,0,0.9)");
                this.play_sound("low_time");
            }
        }, 1000);
    }

    end_game(success) {
        clearInterval(this.timer);
        this.success = success;
        const result = success ? "SUCCESS" : "FAILED";
        const audio = success ? "success" : "failed";

        const html = `<div class="minigame_container pulse_sync">
            <div class="minigame_result_screen">${result}</div>
        </div>`;
        $("#main_container").html(html);
        this.play_sound(audio);

        setTimeout(() => {
            $("#main_container").empty();
            $.post(`https://${GetParentResourceName()}/minigame_result`, JSON.stringify({ game: "tile_shift", success }));
        }, 2500);
    }

    play_sound(key) {
        const url = this.audio[key];
        if (!url) return;
        const audio = new Audio(url);
        audio.volume = this.audio.volume;
        audio.play();
    }
}