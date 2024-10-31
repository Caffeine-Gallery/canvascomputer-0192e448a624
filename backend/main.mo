import Int "mo:base/Int";

import Array "mo:base/Array";
import Buffer "mo:base/Buffer";
import Option "mo:base/Option";
import Text "mo:base/Text";
import Time "mo:base/Time";
import Debug "mo:base/Debug";

actor {
    // Define a type for storing drawings with timestamps
    private type Drawing = {
        imageData: Text;
        timestamp: Int;
    };

    // Store drawings in a stable variable
    private stable var drawings : [Drawing] = [];
    private let drawingsBuffer = Buffer.Buffer<Drawing>(0);

    // Initialize buffer with stable data
    private func initBuffer() {
        for (drawing in drawings.vals()) {
            drawingsBuffer.add(drawing);
        };
    };

    // Called when canister is deployed
    private func init() {
        if (drawingsBuffer.size() == 0) {
            initBuffer();
        };
    };
    init();

    // Save a new drawing
    public shared func saveDrawing(imageData: Text) : async () {
        let newDrawing : Drawing = {
            imageData = imageData;
            timestamp = Time.now();
        };
        drawingsBuffer.add(newDrawing);
        drawings := Buffer.toArray(drawingsBuffer);
    };

    // Get the most recent drawing
    public query func getLastDrawing() : async ?Text {
        let size = drawingsBuffer.size();
        if (size > 0) {
            let lastDrawing = drawingsBuffer.get(size - 1);
            ?lastDrawing.imageData;
        } else {
            null;
        };
    };

    // System functions for upgrades
    system func preupgrade() {
        drawings := Buffer.toArray(drawingsBuffer);
    };

    system func postupgrade() {
        initBuffer();
    };
}
