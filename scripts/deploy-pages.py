#!/usr/bin/env python3
"""Deploy the AgentBoard site to its own Cloudflare Pages project ("agentboard")
by reusing the proven cf_deploy module with overridden PROJECT/SITE_DIR."""
import os, sys

sys.path.insert(0, os.path.expanduser("~/workspace/custom-connectors/custom.cloudflare/bin"))
import cf_deploy

cf_deploy.PROJECT = "agentboard"
cf_deploy.SITE_DIR = os.path.expanduser("~/workspace/agentid-hackathon/site")
sys.exit(cf_deploy.main())
