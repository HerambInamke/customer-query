import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import mongooseDelete from 'mongoose-delete';
import { QUERY_STATUS, QUERY_PRIORITY, QUERY_CATEGORY } from '../constants/index.js';

const attachmentSchema = new mongoose.Schema(
  {
    filename: { type: String, required: true },
    url: { type: String, required: true },
    mimetype: { type: String },
    size: { type: Number },
  },
  { _id: false }
);

const customerQuerySchema = new mongoose.Schema(
  {
    customerName: {
      type: String,
      required: [true, 'Customer name is required'],
      trim: true,
      minlength: [2, 'Customer name must be at least 2 characters'],
      maxlength: [150, 'Customer name cannot exceed 150 characters'],
    },
    customerEmail: {
      type: String,
      required: [true, 'Customer email is required'],
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    customerPhone: {
      type: String,
      trim: true,
      match: [/^[+]?[\d\s\-().]{7,20}$/, 'Please provide a valid phone number'],
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true,
      minlength: [5, 'Subject must be at least 5 characters'],
      maxlength: [255, 'Subject cannot exceed 255 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      minlength: [10, 'Description must be at least 10 characters'],
      maxlength: [5000, 'Description cannot exceed 5000 characters'],
    },
    status: {
      type: String,
      enum: {
        values: Object.values(QUERY_STATUS),
        message: `Status must be one of: ${Object.values(QUERY_STATUS).join(', ')}`,
      },
      default: QUERY_STATUS.OPEN,
    },
    priority: {
      type: String,
      enum: {
        values: Object.values(QUERY_PRIORITY),
        message: `Priority must be one of: ${Object.values(QUERY_PRIORITY).join(', ')}`,
      },
      default: QUERY_PRIORITY.MEDIUM,
    },
    category: {
      type: String,
      enum: {
        values: Object.values(QUERY_CATEGORY),
        message: `Category must be one of: ${Object.values(QUERY_CATEGORY).join(', ')}`,
      },
      required: [true, 'Category is required'],
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    tags: {
      type: [String],
      default: [],
    },
    attachments: {
      type: [attachmentSchema],
      default: [],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

customerQuerySchema.index({ status: 1 });
customerQuerySchema.index({ priority: 1 });
customerQuerySchema.index({ customerEmail: 1 });
customerQuerySchema.index({ createdAt: -1 });
customerQuerySchema.index({ assignedTo: 1 });
customerQuerySchema.index({ subject: 'text', description: 'text' });

customerQuerySchema.plugin(mongoosePaginate);
customerQuerySchema.plugin(mongooseDelete, {
  deletedAt: true,
  overrideMethods: 'all',
});

const CustomerQuery = mongoose.model('CustomerQuery', customerQuerySchema);

export default CustomerQuery;
