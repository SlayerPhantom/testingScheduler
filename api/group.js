const router = require('express').Router();
const Group = require('../models/Group');
const User = require('../models/User');
const Schedule = require('../models/Schedule');

const auth = require('../utils/auth');

router.post('/creategroup', auth, async (req, res) => {
	try {
		const { name } = req.body;
		const monday = [];
		const tuesday = [];
		const wednesday = [];
		const thursday = [];
		const friday = [];
		const saturday = [];
		const sunday = [];
		const schedule = await new Schedule({
			monday,
			tuesday,
			wednesday,
			thursday,
			friday,
			saturday,
			sunday,
		});
		await schedule.save();
		const members = [{ id: req.user.id, username: req.user.username }];
		const newgroup = new Group({
			creator: req.user.username,
			scheduleid: schedule._id,
			members,
			name,
		});
		await newgroup.save();
		const user = await User.findById(req.user.id);
		user.groups.push({ id: newgroup._id, name, creator: req.user.username });
		await user.save();
		return res.json({
			id: newgroup._id,
			scheduleid: schedule._id,
			members,
			message: 'successfully added group',
		});
	} catch (error) {
		console.error(error);
		return res.json({ errors: error });
	}
});

router.post('/adduser', async (req, res) => {
	try {
		const { id, groupname, userid } = req.body;
		const adduser = await User.findById(userid);
		adduser.groups.push({ id, name: groupname });
		await adduser.save();
		const group = await Group.findById(id);
		group.members.push({ id: userid, username: adduser.username });
		await group.save();
		return res.json({ message: 'successfully added user to group' });
	} catch (error) {
		console.error(error);
		return res.json({ errors: error });
	}
});

router.post('/removeuser', async (req, res) => {
	try {
		const { id, userid } = req.body;
		const user = await User.findById(userid);
		user.groups = user.groups.filter((group) => group.id != id);
		await user.save();
		const group = await Group.findById(id);
		group.members = group.members.filter((member) => member.id != userid);
		await group.save();
		return res.json({ message: 'successfully removed user from group' });
	} catch (error) {
		console.error(error);
		return res.json({ errors: error });
	}
});

router.post('/removegroup', async (req, res) => {
	try {
		const { id } = req.body;
		const group = await Group.findById(id);
		const members = group.members;
		members.forEach(async (member) => {
			const user = await User.findById(member.id);
			user.groups = user.groups.filter((_) => _.id !== id);
			await user.save();
		});
		await group.delete();
		return res.json({ message: 'successfully deleted group' });
	} catch (error) {
		console.error(error);
		return res.json({ errors: error });
	}
});

router.post('/getcreator', async (req, res) => {
	try {
		const { id } = req.body;
		const group = await Group.findById(id);
		return res.json({ creator: group.creator, members: group.members });
	} catch (error) {
		console.error(error);
		return res.json({ errors: error });
	}
});

module.exports = router;
