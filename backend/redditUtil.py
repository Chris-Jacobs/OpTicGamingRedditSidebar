import variables
import praw
import re
import datetime
class match:
    def __init__(self, org, date):
        pass

def parseInfo(info):
    r = re.search("- \[\]\((#.*?)\)(.*?)\[\*.*?\*\]\((.*?)\)|- \[\]\((#.*?)\)(.*?)\^\((.*?)\)", info)
    results = r.groups()
    org = results[0] if results[0] is not None else results[3]
    date = results[1] if results[1] is not None else results[4]
    date = date.strip()
    link = results[2]
    t = results[5] if results[5] is not None else ""
    if link is not None:
        if "#live" in link:
            status = "Live"
            link = link.replace("#live", "")
        elif "#final" in link:
            status = "Final"
            link = link.replace("#final", "")
        else:
            status = "N/A"
    else:
        status = "Upcoming"
    return (org, date, link, t, status)

    
    
def parseTeam(team):
    r = re.search("- \[\]\((#.*?)\) (.*)", team)
    results = r.groups()
    sprite = results[0]
    team = results[1]
    r = re.search("(\*{1,2}(.*?)\*{1,2})", team)
    score = r.group(2) if r is not None else None
    if score is not None:
        team = team.replace(r.group(0), "")
    return (sprite, team.strip(), score)
def parseMatch(info, team, opponent):
    parsedInfo = parseInfo(info)
    parsedTeam = parseTeam(team)
    parsedOpponent = parseTeam(opponent)
    return (parsedInfo, parsedTeam, parsedOpponent)
def getSchedule():
    r = praw.Reddit(client_id=variables.client_id,
        client_secret=variables.client_secret,
        user_agent=variables.user_agent,
        username=variables.username,
        password=variables.password)
    sidebar = r.subreddit(variables.subreddit).wiki['edit_sidebar'].content_md
    s = sidebar.index("- [")
    e = sidebar.index("> [](#sep)")
    schedule = sidebar[s:e - 4]
    lines = schedule.split('\n')
    print(lines)
    i = 0
    matches = {}
    while i < len(lines) - 1:
        info = lines[i]
        team = lines[i+1]
        opponent = lines[i+2]
        info, team, opponent = parseMatch(info, team, opponent)
        id = (int) (i/3)
        match = {
            "day": info[1],
            "time": info[3],
            "org": info[0],
            "link": info[2],
            "status": info[4],
            "teamSprite": team[0],
            "teamName": team[1],
            "teamScore": team[2],
            "opponentSprite": opponent[0],
            "opponentName": opponent[1],
            "opponentScore": opponent[2],
            "id": id,
            "order": id
        }
        matches[id] = match
        i += 3
    return matches
def constructMatchString(match):
    print(match)
    winner = 0
    if match['teamScore'] is not None and match['opponentScore'] is not None:
        tScore = int(match['teamScore'])
        oScore = int(match['opponentScore'])
        if tScore > oScore:
            winner = 1
        elif tScore < oScore:
            winner = 2
    else:
        winner = -1
    link = match['link']
    if link is not None:
        index = link.find('#')
        if index > 0:
            match['link'] = link[0:index]
    if match['status'] != 'Upcoming':
        if match['status'] == 'Final':
            teamHighlight = "**" if winner == 1 else "*"
            opponentHighlight = "**" if winner == 2 else "*"
        else:
            teamHighlight = "*"
            opponentHighlight = "*"
        if match['teamScore'] == None:
            match['teamScore'] = "" 
            teamHighlight = ""
        if match['opponentScore'] == None:
            match['opponentScore'] = ""
            opponentHighlight = ""
        line1 = "- []({org}) {day} [*{status}*]({link}#{poundLink})\n".format(org = match['org'], day = match['day'], status = match['status'], link = match['link'], poundLink = match['status'].lower())
        line2 = "  - []({teamSprite}) {teamName} {teamHighlight}{teamScore}{teamHighlight}\n".format(teamSprite = match['teamSprite'], teamName = match['teamName'], teamHighlight = teamHighlight, teamScore = match['teamScore'])
        line3 = "  - []({teamSprite}) {teamName} {teamHighlight}{teamScore}{teamHighlight}\n".format(teamSprite = match['opponentSprite'], teamName = match['opponentName'], teamHighlight = opponentHighlight, teamScore = match['opponentScore'])
    else:
        line1 = "- []({org}) {day} ^({matchTime})\n".format(org = match['org'], day = match['day'], matchTime = match['time'], link = match['link']) 
        line2 = "  - []({teamSprite}) {teamName}\n".format(teamSprite = match['teamSprite'], teamName = match['teamName'])
        line3 = "  - []({teamSprite}) {teamName}\n".format(teamSprite = match['opponentSprite'], teamName = match['opponentName'])
    print(line1)
    print(line2)
    print(line3)    
    return line1 + line2 + line3
def getScheduleWOSidebar():
    r = praw.Reddit(client_id=variables.client_id,
        client_secret=variables.client_secret,
        user_agent=variables.user_agent,
        username=variables.username,
        password=variables.password)
    sidebar = r.subreddit(variables.subreddit).wiki['edit_sidebar'].content_md
    s = sidebar.index("- [")
    e = sidebar.index("> [](#sep)")
    part1 = sidebar[0:s]
    part2 = sidebar[e - 3:]
    return (part1, part2)
def editSchedule(data):
    r = praw.Reddit(client_id=variables.client_id,
        client_secret=variables.client_secret,
        user_agent=variables.user_agent,
        username=variables.username,
        password=variables.password)
    schedule = ""
    matches = []
    for id in data:
        matches.append(data[id])
        match = data[id]
    matches.sort(key = lambda match: match['order'])
    for match in matches:
        schedule += constructMatchString(match) 
    part1, part2 = getScheduleWOSidebar()
    sidebar = part1 + schedule + part2
    if len(sidebar) > 8000:
        return False
    r.subreddit(variables.subreddit).wiki['edit_sidebar'].edit(sidebar)
    return True
def getStylesheet():
    r = praw.Reddit(client_id=variables.client_id,
        client_secret=variables.client_secret,
        user_agent=variables.user_agent,
        username=variables.username,
        password=variables.password)
    stylesheet = r.subreddit('OpTicGaming').stylesheet()
    css = stylesheet.stylesheet
    images = stylesheet.images
    print(images)
    for image in images:
        if image['name'] == 'icons':
            css = css.replace("%%icons%%", image['url'])
            return css
    return ""