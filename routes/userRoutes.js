const express = require('express')
const router = express.Router();
const User = require('./../models/user')
const {jwtAuthMiddleware, generateToken} = require('./../jwt');


// Post route to add a person
router.post('/signup', async (req, res) => {
    try {
        const data = req.body // Assuming the request body contains the person data

        // Create a new User document using the Mongoose model
        const newUser = new User(data);

        // save the new user to the database
        const response = await newUser.save();
        console.log('data saved');

        const payload = {
            id : response.id
        }

        console.log(JSON.stringify(payload));
        const token = generateToken(payload);
        console.log('Token is : ', token);

        res.status(200).json({response: response, token: token});

    } catch (error) {
        console.log(error);
        res.status(500).json({error: 'Internal Server Error'});
    }
})


router.post('/login', async(req, res) => {
    try {
        // Extract aadharCardNumber and password from request body
        const {aadharCardNumber, password} = req.body;

        // check if aadharCardNumber or password is missing
        if(!aadharCardNumber || !password) {
            return res.status(400).json({ error: 'Aadhar Card Number and password are required' })
        }

        // Find the user by aadharCardNumber
        const user  = await User.findOne({aadharCardNumber: aadharCardNumber});

        // If user does not exit or password does not match, return error
        if( !user || !(await user.comparePassword(password))){
            return res.status(401).json({error: 'Invalid Aadhar Card Number or Password'});
        }

        // generate Token
        const payload = {
            id: user.id,
        }
        const token = generateToken(payload);

        // return token as response
        res.json({token})
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
})

// Profile route
router.get('/profile', jwtAuthMiddleware, async(req, res) => {
    try {
        const userData = req.user;
        const userId = userData.id;
        const user = await User.findById(userId);
        res.status(200).json({user});
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server Error' })
    }
})

router.put('/profile/password',jwtAuthMiddleware, async(req, res) => {
    try {
        const userId = req.user.id; //Extract the id from the token
        const { currentPassword, newPassword } = req.body; // Extract current and new password from request body

        // check if currentpassword and newPassword are present in the request body
        if(!currentPassword || !newPassword){
            return res.status(400).json({ error: 'Both currentPassword and newPassword are required' })
        }

        // Find the user by userId
        const user = await User.findById(userId);

        // If user does not exist or password does not match, return error
        if(!user || !(await user.comparePassword(currentPassword))){
            return res.status(401).json({ error:'Invalid current password' });
        }

        // Update the user's password
        user.password = newPassword;
        await user.save();

        console.log('password updated');
        res.status(200).json({ message: 'Password updated' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server Error' })
    }
})

module.exports = router;




