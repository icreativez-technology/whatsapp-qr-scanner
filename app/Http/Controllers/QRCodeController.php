<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class QRCodeController extends Controller
{
    public function uploadQR(Request $request)
    {
        $request->validate([
            'image' => 'required|string'
        ]);

        // Decode base64 image
        $imageData = base64_decode($request->image);
        $fileName = 'qrcodes/' . Str::random(20) . '.png';

        // Store image
        Storage::disk('public')->put($fileName, $imageData);

        // Broadcast event
        event(new \App\Events\QRCodeEvent(asset('storage/' . $fileName)));

        return response()->json([
            'url' => asset('storage/' . $fileName)
        ]);
    }

    public function deleteQR(Request $request)
    {
        $request->validate([
            'qr_url' => 'required|string'
        ]);

        $path = parse_url($request->qr_url, PHP_URL_PATH);
        $fileName = basename($path);

        $storagePath = 'qrcodes/' . $fileName;
        if (Storage::disk('public')->exists($storagePath)) {
            Storage::disk('public')->delete($storagePath);
            return response()->json(['success' => true]);
        }

        return response()->json(['success' => false, 'message' => 'File not found'], 404);
    }
}
