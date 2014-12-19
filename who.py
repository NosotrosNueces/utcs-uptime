#!/usr/bin/python
"""who.py executes 'ssh <username>@<server> w' for all servers given.
Command line args:
    ./who.py <USERNAME> <SERVERS_FILE>
SERVERS_FILE is a simple newline-delimited textfile of all the servers.

NOTE: Assumes all servers use port 22 for SSH.
"""

import subprocess
import sys
import time
# import ldap3

USERNAME = sys.argv[1]
SERVERS_FILE = sys.argv[2]
INTERVAL = 0.2
# LDAP_SERVER = ldap3.Server("directory.utexas.edu", port=389,
#                            get_info=ldap3.GET_ALL_INFO)

# def eid_to_cn(eid):
#     """Use LDAP to reverse-lookup a eid for a common name."""
#     conn = ldap3.Connection(LDAP_SERVER, auto_bind=True)
#     if conn.search("dc=directory,dc=utexas,dc=edu",
#                    "(utexasEduPersonEid={eid})".format(eid=eid),
#                    ldap3.SEARCH_SCOPE_WHOLE_SUBTREE, attributes=['cn']):
#         return conn.response[0]['attributes']['cn'][0]
#     else:
#         # LDAP search returned no results.
#         return "Anymouse"

def get_servers(filename):
    """Read servernames from a newline-delimited text file."""
    with open(filename, 'r') as servers:
        return servers.read().split('\n')[:-1]

def ssh_who(username, servername, port=22):
    """Runs 'w' over ssh using the given params.
    Assumes you have a public key set up.
    """
    cmd = ["ssh",
           "{username}@{server}".format(username=username,
                                        server=servername),
           "-p{port}".format(port=port), "w"]
    proc = subprocess.Popen(cmd, stdout=subprocess.PIPE)
    # Don't include yourself in results.
    names = [_.split(' ')[0]\
             for _ in proc.stdout.read().decode().split('\n')[2:-1] if\
             _.split(' ')[0] != USERNAME]
    return sorted(list(set(names)))

if __name__ == "__main__":
    RESULTS = {}

    # Fetch data of users on servers.
    for server in get_servers(SERVERS_FILE):
        # Probably overly cautious sleeping.
        time.sleep(INTERVAL)
        RESULTS[server] = ssh_who(USERNAME, server)

    # Print results.
    for server, users in RESULTS.items():
        print(server)
        print(("\t"+', '.join(users)) if users else "...nobody...")
        print()

    #for server, eids in RESULTS.items():
    #    users = [eid_to_cn(eid) for eid in eids]
    #    print(server)
    #    print(("\t"+', '.join(users)) if users else "...nobody...")
    #    print()
