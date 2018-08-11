import sqlite3
conn = sqlite3.connect('keys.db')
c = conn.cursor()
username, password, user_agent, twitchKey, client_secret, client_id, ytKey, imgurID, imgurSecret, schedulerbase, mod_username, mod_password, mod_client_secret, mod_client_id = c.execute("SELECT * FROM Keys").fetchone()
c.close()
subreddit = "OpTicGaming"