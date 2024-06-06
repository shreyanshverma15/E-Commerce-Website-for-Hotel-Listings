const Listing = require("../models/listing");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const mbxClient = require('@mapbox/mapbox-sdk');
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

module.exports.index = async (req, res) =>
    {
        const allListings = await Listing.find({});
        res.render("listings/index.ejs", { allListings });
    };

module.exports.renderNewForm = (req, res) =>
    {
        res.render("listings/new.ejs");
    };

module.exports.showListing = async (req, res) =>
    {
        let {id} = req.params;  
        const listing = await Listing.findById(id).populate({path: "reviews", populate: {path: "author",}}).populate("owner"); 
        if(!listing)
        {
            req.flash("error", "listing you requested for does not exist");
            res.redirect("/listings");
        }
        
        res.render("listings/show.ejs", {listing});
    };

module.exports.createListing = async (req, res, next) =>
    {
        // if(!req.body.listing)
        // {
        //     throw new ExpressError(400, "send valid data for listing");
        // }
        // //let {title, description, image, price, country, location} = req.body;
        // let result = listingSchema.validate(req.body);
        // console.log(result);
        // if(result.error)
        // {
        //     throw new ExpressError(400, result.error);
        // }
        let response = await geocodingClient.forwardGeocode({
            query: req.body.listing.location,
            limit: 2,
          })
            .send();

            console.log(response.body.features[0].geometry);
        
        let url = req.file.path;
        let filename = req.file.filename;
        let listing = req.body.listing;
        const newListing = new Listing(listing);
        newListing.owner = req.user._id;
        newListing.image = {url, filename};
        newListing.geometry = response.body.features[0].geometry;
        await newListing.save();
        console.log(newListing);
        req.flash("success", "new listing created");
        res.redirect("/listings");
    };

module.exports.renderEditForm = async (req, res) =>
    {
        let {id} = req.params;  
        const listing = await Listing.findById(id);  
        if(!listing)
        {
            req.flash("error", "listing you requested for does not exist");
            res.redirect("/listings");
        }

        let originalImageUrl = listing.image.url;
        originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250");
        res.render("listings/edit.ejs", {listing, originalImageUrl});
    };

module.exports.updateListing = async (req, res) =>
    {
        // if(!req.body.listing)
        // {
        //     throw new ExpressError(400, "send valid data for listing");
        // }
        let {id} = req.params; 
        const listing = await Listing.findByIdAndUpdate(id, {...req.body.listing});
        
        if(typeof req.file !== "undefined") 
        {
            let url = req.file.path;
            let filename = req.file.filename;
            listing.image = {url, filename};
            await listing.save();
        }
        req.flash("success", "listing updated");
        res.redirect(`/listings/${id}`);
    };

module.exports.destroyListing = async(req, res) =>
    {
        let {id} = req.params;
        let deletedListing = await Listing.findByIdAndDelete(id);
        req.flash("success", "listing deleted");
        res.redirect("/listings");
    };