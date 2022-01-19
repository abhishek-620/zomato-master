import express from "express";
import bcrypt from "bcryptjs";

import {UserModel} from "../../database/user";


import {ValidateSignup, ValidateSignin} from "../../validation/auth";

const Router = express.Router();



Router.post("/signup", async(req,res)=> {
  try {
    await ValidateSignup(req.body.credentials);
    const {email, password, fullname, phoneNumber} = req.body.credentials;

    const checkUserByEmail = await UserModel.findOne({email});
    const checkUserByPhone = await UserModel.findOne({phoneNumber});

    if(checkUserByEmail || checkUserByPhone) {
      return res.json({error: "User already Exists!!!!!!"});
    }


    const bcryptSalt = await bcrypt.genSalt(8);
    const hashedPassword = await bcrypt.hash(password, bcryptSalt);


await UserModel.create({
  ...req.body.credentials,
  password: hashedPassword
});


const token = jwt.sign({user: {fullname, email}}, "ZomatoApp");

return res.status(200).json({token, status: "success"});
  } catch (error) {
    return res.status(500).json({error: error.message});
  }
});




Router.post("/signin", async(req,res)=> {
  try {
   await ValidateSignin(req.body.credentials);
   const user = await UserModel.findByEmailAndPassword(
     req.body.credentials
   );
   const token = user.generateJwtToken();
   return res.status(200).json({token, status: "success"});
     } catch (error) {
       return res.status(500).json({error: error.message});
     }
});
