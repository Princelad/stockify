const mongoose = require('mongoose');

const labelTemplateSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },
    size: {
        type: String,
        required: true,
        trim: true
    },
    fields: {
        type: [String],
        required: true,
        validate: {
            validator: function(fields) {
                return fields && fields.length > 0;
            },
            message: 'At least one field is required'
        }
    },
    layout: {
        type: String,
        required: true,
        enum: ['single', 'grid'],
        default: 'single'
    },
    settings: {
        fontSize: {
            type: Number,
            default: 10,
            min: 6,
            max: 24
        },
        fontFamily: {
            type: String,
            default: 'Arial',
            enum: ['Arial', 'Arial Bold', 'Times New Roman', 'Courier New', 'Helvetica']
        },
        backgroundColor: {
            type: String,
            default: '#ffffff',
            match: /^#[0-9A-F]{6}$/i
        },
        textColor: {
            type: String,
            default: '#000000',
            match: /^#[0-9A-F]{6}$/i
        },
        showBorder: {
            type: Boolean,
            default: true
        },
        borderColor: {
            type: String,
            default: '#000000',
            match: /^#[0-9A-F]{6}$/i
        },
        padding: {
            type: Number,
            default: 4,
            min: 0,
            max: 20
        },
        alignment: {
            type: String,
            default: 'left',
            enum: ['left', 'center', 'right']
        }
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    usageCount: {
        type: Number,
        default: 0
    },
    lastUsed: {
        type: Date
    }
}, {
    timestamps: true
});

// Indexes for better performance
labelTemplateSchema.index({ createdBy: 1, isActive: 1 });
labelTemplateSchema.index({ createdBy: 1, name: 1 }, { unique: true });

// Pre-save middleware to validate field names
labelTemplateSchema.pre('save', function(next) {
    const validFields = [
        'name', 'sku', 'price', 'wholesalePrice', 'category', 
        'barcode', 'stock', 'description', 'brand', 'supplier'
    ];
    
    const invalidFields = this.fields.filter(field => !validFields.includes(field));
    if (invalidFields.length > 0) {
        const error = new Error(`Invalid fields: ${invalidFields.join(', ')}`);
        return next(error);
    }
    
    next();
});

// Instance method to increment usage
labelTemplateSchema.methods.incrementUsage = function() {
    this.usageCount += 1;
    this.lastUsed = new Date();
    return this.save();
};

// Static method to find templates by user
labelTemplateSchema.statics.findByUser = function(userId) {
    return this.find({ 
        createdBy: userId, 
        isActive: true 
    }).sort({ lastUsed: -1, createdAt: -1 });
};

// Static method to find popular templates
labelTemplateSchema.statics.findPopular = function(userId, limit = 5) {
    return this.find({ 
        createdBy: userId, 
        isActive: true,
        usageCount: { $gt: 0 }
    })
    .sort({ usageCount: -1, lastUsed: -1 })
    .limit(limit);
};

// Virtual for display name with usage info
labelTemplateSchema.virtual('displayName').get(function() {
    if (this.usageCount > 0) {
        return `${this.name} (Used ${this.usageCount} times)`;
    }
    return this.name;
});

// Ensure virtual fields are serialized
labelTemplateSchema.set('toJSON', { virtuals: true });

const LabelTemplate = mongoose.model('LabelTemplate', labelTemplateSchema);

module.exports = LabelTemplate;