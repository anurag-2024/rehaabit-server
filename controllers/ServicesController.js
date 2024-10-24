const Service = require("../models/Service");
const RatingAndReview = require("../models/RatingAndReviews");
const Faq = require("../models/FAQ");
const Include = require("../models/Include");
const Exclude = require("../models/Exclude");
const HowDoesItWorks = require("../models/HowDoesItWorks");
const SubCategory = require("../models/SubCategory");
const { uploadImageToCloudinary } = require("../utils/imageUploader");

// CREATE a new Service
exports.createService = async (req, res) => {
  try {
    let {
      categoryId,
      subCategoryId,
      serviceName,
      serviceDescription,
      timeToComplete,
      price,
      warranty,
      status,
      priceStatus,
      metaTitle,
      metaDescription,
    } = req.body;

    // Handle file upload
    let thumbnailImage;
    if (req.files && req.files.thumbnail) {
      thumbnailImage = await uploadImageToCloudinary(
        req.files.thumbnail,
        process.env.FOLDER_NAME,
        serviceName
      );
    }

    // Validate the input
    if (
      !serviceName ||
      !serviceDescription ||
      !price ||
      !subCategoryId ||
      !categoryId ||
      !thumbnailImage
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    // Create a new Service
    const newService = await Service.create({
      serviceName,
      serviceDescription,
      timeToComplete,
      price,
      warranty,
      status: status || "Draft",
      priceStatus: priceStatus || "priced",
      thumbnail: thumbnailImage.secure_url,
      categoryId,
      subCategoryId,
      metaTitle,
      metaDescription,
    });

    // Add the new SubCategory to the Category's content array
    const updatedSubCategory = await SubCategory.findByIdAndUpdate(
      subCategoryId,
      {
        $push: {
          service: newService._id,
        },
      },
      { new: true }
    )
      .populate({
        path: "service",
      })
      .exec();
    console.log("updatedSubCategory", updatedSubCategory);
    res.status(201).json({
      success: true,
      message: "Service created successfully",
      service: newService,
      updatedSubCategory,
    });
  } catch (error) {
    console.error("Error creating service:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// UPDATE a Service
exports.editService = async (req, res) => {
  try {
    const {
      serviceId,
      serviceName,
      serviceDescription,
      timeToComplete,
      price,
      warranty,
      status,
      priceStatus,
      metaTitle,
      metaDescription,
    } = req.body;

    const thumbnail = req.files ? req.files.thumbnail : null;

    // Validate the input
    if (!serviceId) {
      return res.status(400).json({
        success: false,
        message: "Service ID are required",
      });
    }

    let updates = {
      serviceName,
      serviceDescription,
      timeToComplete,
      price,
      warranty,
      status,
      priceStatus,
      metaTitle,
      metaDescription,
    };

    if (thumbnail) {
      const thumbnailImage = await uploadImageToCloudinary(
        thumbnail,
        process.env.FOLDER_NAME
      );
      updates.thumbnail = thumbnailImage.secure_url;
    }

    // Remove undefined fields from updates
    updates = Object.fromEntries(
      Object.entries(updates).filter(([_, v]) => v != null)
    );

    // Update the service
    const updatedService = await Service.findByIdAndUpdate(serviceId, updates, {
      new: true,
    });

    if (!updatedService) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Service updated successfully",
      data: updatedService,
    });
  } catch (error) {
    console.error("Error updating service:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

exports.deleteService = async (req, res) => {
  try {
    const { serviceId, subCategoryId } = req.body;

    // Validate input
    if (!serviceId || !subCategoryId) {
      return res.status(400).json({
        success: false,
        message: "Service ID and SubCategory ID are required",
      });
    }

    // Find the service
    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    // Remove the service reference from the SubCategory
    await SubCategory.findByIdAndUpdate(subCategoryId, {
      $pull: { services: serviceId },
    });

    // Delete the service
    const deletedService = await Service.findByIdAndDelete(serviceId);

    // Optionally, you may want to delete related documents (howDoesItWorks, includes, excludes, faqs, ratingAndReviews) if needed.
    // Example:
    await HowDoesItWorks.deleteMany({ _id: { $in: service.howDoesItWorks } });
    await Include.deleteMany({ _id: { $in: service.includes } });
    await Exclude.deleteMany({ _id: { $in: service.excludes } });
    await Faq.deleteMany({ _id: { $in: service.faqs } });
    // await RatingAndReview.deleteMany({ _id: { $in: service.ratingAndReviews } });

    return res.status(200).json({
      success: true,
      message: "Service deleted successfully",
      data: deletedService,
    });
  } catch (error) {
    console.error("Error deleting service:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Get full service details
exports.getFullServiceDetails = async (req, res) => {
  try {
    const { serviceId } = req.body;

    if (!serviceId) {
      return res.status(400).json({
        success: false,
        message: "Service ID is required",
      });
    }

    const service = await Service.findById(serviceId)
      .populate("howDoesItWorks")
      .populate("includes")
      .populate("excludes")
      .populate("faqs")
      .populate({
        path: "ratingAndReviews",
        populate: {
          path: "user",
          select: "firstName lastName",
          model: "User",
          populate: {
            path: "additionalDetails",
            select: "firstName lastName",
            model: "Profile",
          },
        },
      });

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    res.status(200).json({
      success: true,
      data: service,
    });
  } catch (error) {
    console.error("Error fetching service details:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// GET all Services
exports.getAllServices = async (req, res) => {
  try {
    // Fetch all services from the database
    const allServices = await Service.find({}).populate([
      {
        path: "howDoesItWorks",
      },
      {
        path: "includes",
      },
      {
        path: "excludes",
      },
      {
        path: "faqs",
      },
      {
        path: "ratingAndReviews",
        populate: {
          path: "user",
          select: "firstName lastName",
          model: "User",
          populate: {
            path: "additionalDetails",
            select: "firstName lastName",
            model: "Profile",
          },
        },
      },
    ]);

    // Return the fetched services
    return res.status(200).json({
      success: true,
      data: allServices,
    });
  } catch (error) {
    console.error("Error fetching all services:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Get the services for the published service
exports.getAllPublishedServices = async (req, res) => {
  try {
    // Fetch all published services
    const allServices = await Service.find({ status: "Published" }).populate([
      {
        path: "howDoesItWorks",
      },
      {
        path: "includes",
      },
      {
        path: "excludes",
      },
      {
        path: "faqs",
      },
      {
        path: "ratingAndReviews",
      },
    ]);

    // Return the fetched services
    return res.status(200).json({
      success: true,
      data: allServices,
    });
  } catch (error) {
    console.error("Error fetching all services:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Get services by no priced and published
exports.getAllNoPricedPublishedServices = async (req, res) => {
  try {
    // Fetch all published services without pricing
    const allServices = await Service.find({
      status: "Published",
      price: 0,
    }).populate([
      {
        path: "howDoesItWorks",
      },
      {
        path: "includes",
      },
      {
        path: "excludes",
      },
      {
        path: "faqs",
      },
      {
        path: "ratingAndReviews",
      },
    ]);

    // Return the fetched services
    return res.status(200).json({
      success: true,
      data: allServices,
    });
  } catch (error) {
    console.error("Error fetching all services:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// GET total number of services in the database
exports.getTotalServicesCount = async (req, res) => {
  try {
    // Get the total count of services
    const totalServicesCount = await Service.countDocuments();

    // Return the total count
    return res.status(200).json({
      success: true,
      totalServices: totalServicesCount,
    });
  } catch (error) {
    console.error("Error fetching total services count:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Get the rating and reviews for the service
exports.getServiceRatingAndReviews = async (req, res) => {
  try {
    const { serviceId, page = 1 } = req.query;
    const service = await Service.findById(serviceId).populate({
      path: "ratingAndReviews",
      populate: {
        path: "user",
        select: "firstName lastName",
        model: "User",
        populate: {
            path: "additionalDetails",
            select: "firstName lastName",
            model: "Profile",
          },
        },
    });

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }
    const ratingAndReviews = service.ratingAndReviews;
    const itemsPerPage = 5;
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, ratingAndReviews.length);
    const paginatedRatingAndReviews = ratingAndReviews.slice(startIndex, endIndex);
    console.log(paginatedRatingAndReviews);
    return res.status(200).json({
      success: true,
      data: paginatedRatingAndReviews,
      totalRatingAndReviews: ratingAndReviews.length,
    });
  } catch (error) {
    console.error("Error fetching service rating and reviews:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
