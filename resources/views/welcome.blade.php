<!DOCTYPE html>
<html>
<head>
    <title>WhatsApp QR Scanner</title>
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body>
    <div class="container mt-5">
        <div class="row justify-content-center">
            <div class="col-md-6">
                <div class="card">
                    <div class="card-header">WhatsApp QR Code</div>
                    <div class="card-body text-center">
                        <div id="qr-container">
                            <p class="text-muted">Waiting for QR code...</p>
                        </div>
                        <div id="status-message" class="mt-3"></div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script src="https://js.pusher.com/7.0/pusher.min.js"></script>
    <script>

        const pusher = new Pusher('{{ env('PUSHER_APP_KEY') }}', {
            cluster: '{{ env('PUSHER_APP_CLUSTER') }}'
        });

        const channel = pusher.subscribe('qr-channel');

        channel.bind('App\\Events\\QRCodeEvent', function(data) {
            document.getElementById('qr-container').innerHTML = `
                <img src="${data.qrUrl}" alt="WhatsApp QR Code" class="img-fluid">
                <p class="mt-2">Scan this QR code with your WhatsApp mobile app</p>
            `;
        });

        channel.bind('login_success', function() {
            document.getElementById('status-message').innerHTML = `
                <div class="alert alert-success">Login successful!</div>
            `;
        });
    </script>
</body>
</html>
