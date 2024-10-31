import { backend } from "declarations/backend";

class DrawingApp {
    constructor() {
        this.canvas = document.getElementById('drawingCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.isDrawing = false;
        this.currentTool = 'pencil';
        this.startX = 0;
        this.startY = 0;
        this.setupCanvas();
        this.setupEventListeners();
        this.setupToolbar();
    }

    setupCanvas() {
        this.canvas.width = window.innerWidth - 50;
        this.canvas.height = window.innerHeight - 150;
        this.ctx.fillStyle = 'white';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    setupToolbar() {
        document.querySelectorAll('[data-tool]').forEach(button => {
            button.addEventListener('click', (e) => {
                document.querySelectorAll('[data-tool]').forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                this.currentTool = e.target.dataset.tool;
            });
        });

        document.querySelector('[data-tool="pencil"]').classList.add('active');
    }

    setupEventListeners() {
        this.canvas.addEventListener('mousedown', this.startDrawing.bind(this));
        this.canvas.addEventListener('mousemove', this.draw.bind(this));
        this.canvas.addEventListener('mouseup', this.stopDrawing.bind(this));
        this.canvas.addEventListener('mouseout', this.stopDrawing.bind(this));

        document.getElementById('clearCanvas').addEventListener('click', () => {
            this.ctx.fillStyle = 'white';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        });

        document.getElementById('saveDrawing').addEventListener('click', async () => {
            this.showSpinner(true);
            try {
                const imageData = this.canvas.toDataURL('image/png').split(',')[1];
                await backend.saveDrawing(imageData);
                alert('Drawing saved successfully!');
            } catch (error) {
                console.error('Error saving drawing:', error);
                alert('Error saving drawing');
            }
            this.showSpinner(false);
        });

        document.getElementById('loadDrawing').addEventListener('click', async () => {
            this.showSpinner(true);
            try {
                const imageData = await backend.getLastDrawing();
                if (imageData) {
                    const img = new Image();
                    img.onload = () => {
                        this.ctx.drawImage(img, 0, 0);
                        this.showSpinner(false);
                    };
                    img.src = 'data:image/png;base64,' + imageData;
                } else {
                    alert('No saved drawing found');
                    this.showSpinner(false);
                }
            } catch (error) {
                console.error('Error loading drawing:', error);
                alert('Error loading drawing');
                this.showSpinner(false);
            }
        });
    }

    showSpinner(show) {
        document.getElementById('loadingSpinner').classList.toggle('d-none', !show);
    }

    startDrawing(e) {
        this.isDrawing = true;
        const rect = this.canvas.getBoundingClientRect();
        this.startX = e.clientX - rect.left;
        this.startY = e.clientY - rect.top;
        
        if (this.currentTool === 'pencil') {
            this.ctx.beginPath();
            this.ctx.moveTo(this.startX, this.startY);
        }
    }

    draw(e) {
        if (!this.isDrawing) return;

        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        this.ctx.strokeStyle = document.getElementById('colorPicker').value;
        this.ctx.lineWidth = document.getElementById('lineWidth').value;
        this.ctx.lineCap = 'round';

        if (this.currentTool === 'pencil') {
            this.ctx.lineTo(x, y);
            this.ctx.stroke();
        } else {
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = this.canvas.width;
            tempCanvas.height = this.canvas.height;
            const tempCtx = tempCanvas.getContext('2d');
            tempCtx.drawImage(this.canvas, 0, 0);

            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.drawImage(tempCanvas, 0, 0);

            this.ctx.beginPath();
            switch(this.currentTool) {
                case 'line':
                    this.ctx.moveTo(this.startX, this.startY);
                    this.ctx.lineTo(x, y);
                    break;
                case 'rectangle':
                    const width = x - this.startX;
                    const height = y - this.startY;
                    this.ctx.rect(this.startX, this.startY, width, height);
                    break;
                case 'circle':
                    const radius = Math.sqrt(Math.pow(x - this.startX, 2) + Math.pow(y - this.startY, 2));
                    this.ctx.arc(this.startX, this.startY, radius, 0, 2 * Math.PI);
                    break;
            }
            this.ctx.stroke();
        }
    }

    stopDrawing() {
        this.isDrawing = false;
    }
}

window.addEventListener('load', () => {
    new DrawingApp();
});
