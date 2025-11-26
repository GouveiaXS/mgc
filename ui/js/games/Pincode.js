/*
    This file is part of MGC and is licensed under the MIT License.
    See the LICENSE file in the root directory for full terms.

    © 2025 Case @ Playing In Traffic

    Support honest development - retain this credit. Don't be that guy...
*/

export default class Pincode {
    constructor() {
        this.difficulty = 1;
        this.max_attempts = 6;
        this.code = "";
        this.code_length = 4;
        this.attempts_remaining = 6;

        this.audio = {
            clicked_key: 'assets/audio/beep.ogg',
            success: 'assets/audio/succeeded.ogg',
            failed: 'assets/audio/system_fault.ogg',
            volume: 0.2
        };
    }

    init(data) {
        this.difficulty = data.difficulty || 1;
        this.code_length = 3 + this.difficulty;
        this.max_attempts = 6;
        this.attempts_remaining = this.max_attempts;
        this.code = this.generate_code(this.code_length);

        $(document).on("keyup", (e) => {
            if (e.key === "Escape") this.game_end(false);
        });

        this.build_ui();
    }

    generate_code(length) {
        return Array.from({ length }, () => Math.floor(Math.random() * 10)).join('');
    }

    build_ui() {
        const audio_elements = Object.entries(this.audio).map(([key, src]) =>
            `<audio id="${key}_sound" src="${src}" preload="auto"></audio>`
        ).join('');

        const content = `
            <div class="minigame_container pincode">
                <div class="pc_cont">
                    <div class="pincode_display">
                        <div class="pincode_digits">${'*'.repeat(this.code_length)}</div>
                    </div>
                    <div class="attempts_remaining">Attempts Remaining: ${this.attempts_remaining}</div>
                    <div class="pincode_keypad">${this.gen_keypad_buttons()}</div>
                    <div class="pincode_submit">
                        <button class="pincode_submit_button"><i class="fa-solid fa-lock"></i></button>
                    </div>
                </div>
            </div>
            ${audio_elements}
        `;

        $('#main_container').html(content);

        Object.keys(this.audio).forEach((key) => {
            $(`#${key}_sound`)[0].volume = this.audio.volume;
        });

        $('.keypad_button').on('click', (e) => {
            this.handle_keypad_input($(e.target).text());
            this.play_sound('clicked_key');
        });

        $('.pincode_submit_button').on('click', () => {
            this.submit_pincode();
        });
    }

    gen_keypad_buttons() {
        const buttons = [1, 2, 3, 4, 5, 6, 7, 8, 9, '*', 0, '#'];
        return buttons.map(n => `<button class="keypad_button">${n}</button>`).join('');
    }

    handle_keypad_input(input) {
        let current = $('.pincode_digits').text().replace(/\*/g, '');
        if ($('.pincode_digits').html().includes('<span')) {
            $('.pincode_digits').text('*'.repeat(this.code_length));
            current = '';
        }

        if (current.length < this.code_length) {
            $('.pincode_digits').text((current + input).padEnd(this.code_length, '*'));
        }
    }

    submit_pincode() {
        const guess = $('.pincode_digits').text().replace(/\*/g, '');
        if (guess.length !== this.code_length) return;

        const result = this.check_guess(guess);
        this.display_result_coloring(guess, result);
        this.attempts_remaining--;

        $('.attempts_remaining').text(`Attempts Remaining: ${this.attempts_remaining}`);

        if (result.correct_positions === this.code_length) {
            this.game_end(true);
        } else if (this.attempts_remaining <= 0) {
            this.game_end(false);
        }
    }

    check_guess(guess) {
        let correct_positions = 0;
        let correct_digits = 0;

        const guess_arr = [...guess];
        const code_arr = [...this.code];

        for (let i = 0; i < guess_arr.length; i++) {
            if (guess_arr[i] === code_arr[i]) {
                correct_positions++;
                guess_arr[i] = null;
                code_arr[i] = null;
            }
        }

        for (let i = 0; i < guess_arr.length; i++) {
            const idx = code_arr.indexOf(guess_arr[i]);
            if (guess_arr[i] && idx !== -1) {
                correct_digits++;
                code_arr[idx] = null;
            }
        }

        return { correct_digits, correct_positions };
    }

    display_result_coloring(guess, result) {
        let output = '';
        for (let i = 0; i < guess.length; i++) {
            if (guess[i] === this.code[i]) {
                output += `<span style="color: green;">${guess[i]}</span>`;
            } else if (this.code.includes(guess[i])) {
                output += `<span style="color: yellow;">${guess[i]}</span>`;
            } else {
                output += `<span style="color: red;">${guess[i]}</span>`;
            }
        }
        $('.pincode_digits').html(output);
    }

    game_end(success) {
        const message = success ? 'ACCESS GRANTED' : 'ACCESS DENIED';
        const color = success ? 'green' : 'red';
        const audio_key = success ? 'success' : 'failed';

        $('.pincode_digits').html(`<span style="color: ${color}; font-size: 2rem;">${message}</span>`);
        this.play_sound(audio_key);

        setTimeout(() => {
            $('#main_container').empty();
            $.post(`https://${GetParentResourceName()}/minigame_result`, JSON.stringify({ game: "pin_code", success }));
        }, 2000);
    }

    play_sound(key) {
        const audio = $(`#${key}_sound`)[0];
        if (audio) audio.play();
    }
}