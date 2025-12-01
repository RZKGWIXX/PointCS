from flask import Flask, render_template, request, jsonify
import random
import os

app = Flask(__name__, 
            template_folder=os.path.dirname(os.path.abspath(__file__)),
            static_folder=os.path.dirname(os.path.abspath(__file__)),
            static_url_path='')

# Simple game state
games = {
    'points': 1000,
    'history': []
}

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/api/balance', methods=['GET'])
def get_balance():
    return jsonify({'points': games['points']})

@app.route('/api/spin', methods=['POST'])
def spin():
    bet = request.json.get('bet', 10)
    
    if bet > games['points']:
        return jsonify({'error': 'Insufficient points'}), 400
    
    result = random.randint(1, 6)
    win = bet * 2 if result > 3 else -bet
    games['points'] += win
    
    games['history'].append({'bet': bet, 'result': result, 'win': win})
    
    return jsonify({
        'result': result,
        'win': win,
        'points': games['points'],
        'history': games['history'][-10:]
    })

@app.route('/api/history', methods=['GET'])
def history():
    return jsonify({'history': games['history']})

@app.route('/api/update-balance', methods=['POST'])
def update_balance():
    data = request.json
    games['points'] = data.get('points', games['points'])
    return jsonify({'points': games['points']})

if __name__ == '__main__':
    # Production ready - use PORT environment variable
    port = int(os.environ.get('PORT', 3000))
    app.run(host='0.0.0.0', port=port, debug=False)