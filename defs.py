
# Copyright 2018 Paul Harwood
#
# ALL RIGHTS RESERVED
#
import os

# START Global variables

# END Global variables


def is_devserver():
    """Check if the app is running on devserver or not."""
    return 'DEV' in os.environ